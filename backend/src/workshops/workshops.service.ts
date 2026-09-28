import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Workshop, WorkshopStatus } from './entities/workshop.entity';
import { Registration, RegistrationStatus } from '../registrations/entities/registration.entity';
import { CreateWorkshopDto, UpdateWorkshopDto } from './dto/workshop.dto';
import { clean, uniqueSlug } from '../common/utils/unique-slug';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop) private readonly repo: Repository<Workshop>,
    @InjectRepository(Registration) private readonly registrations: Repository<Registration>,
  ) {}

  /** Attendees booked per workshop (cancelled registrations don't count). */
  async bookedMap(ids?: string[]) {
    const qb = this.registrations
      .createQueryBuilder('r')
      .select('r.workshopId', 'id')
      .addSelect('COALESCE(SUM(r.attendees),0)', 'n')
      .where('r.status != :c', { c: RegistrationStatus.CANCELLED })
      .groupBy('r.workshopId');
    if (ids?.length) qb.andWhere('r.workshopId IN (:...ids)', { ids });
    const rows: { id: string; n: string }[] = await qb.getRawMany();
    return new Map(rows.map((r) => [r.id, Number(r.n)]));
  }

  /** Adds spotsLeft / full / canRegister — the registration rules in one place. */
  present(w: Workshop, booked: number) {
    const spotsLeft = w.capacity != null ? Math.max(0, w.capacity - booked) : null;
    const full = spotsLeft === 0;
    return { ...w, booked, spotsLeft, full, canRegister: w.status !== WorkshopStatus.CLOSED && !full };
  }

  async findPublic() {
    const rows = await this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC' } });
    const booked = await this.bookedMap(rows.map((r) => r.id));
    return rows.map((w) => this.present(w, booked.get(w.id) || 0));
  }

  async findAllAdmin() {
    const rows = await this.repo.find({ order: { sortOrder: 'ASC' } });
    const booked = await this.bookedMap();
    return rows.map((w) => this.present(w, booked.get(w.id) || 0));
  }

  async findOne(id: string) {
    const w = await this.repo.findOne({ where: { id } });
    if (!w) throw new NotFoundException('Workshop not found.');
    return w;
  }

  private apply(w: Workshop, dto: UpdateWorkshopDto) {
    for (const k of ['summary', 'details', 'image', 'imageAlt', 'startsAt', 'duration', 'materials', 'location'] as const) {
      if (dto[k] !== undefined) (w as any)[k] = clean(dto[k]);
    }
    if (dto.status !== undefined) w.status = dto.status;
    if (dto.price !== undefined) w.price = dto.price;
    if (dto.capacity !== undefined) w.capacity = dto.capacity;
    if (dto.published !== undefined) w.published = dto.published;
  }

  async create(dto: CreateWorkshopDto) {
    const w = this.repo.create({
      title: dto.title.trim(),
      slug: await uniqueSlug(this.repo, dto.title, undefined, 'workshop'),
      status: WorkshopStatus.TBA,
      published: false,
      sortOrder: await this.repo.count(),
    });
    this.apply(w, dto);
    const saved = await this.repo.save(w);
    return this.present(saved, 0);
  }

  async update(id: string, dto: UpdateWorkshopDto) {
    const w = await this.findOne(id);
    if (dto.title !== undefined && dto.title.trim() !== w.title) {
      w.title = dto.title.trim();
      w.slug = await uniqueSlug(this.repo, w.title, w.id, 'workshop');
    }
    this.apply(w, dto);
    const saved = await this.repo.save(w);
    return this.present(saved, (await this.bookedMap([id])).get(id) || 0);
  }

  async reorder(ids: string[]) {
    if ((await this.repo.count({ where: { id: In(ids) } })) !== ids.length) throw new BadRequestException('Unknown workshop id in reorder list.');
    await Promise.all(ids.map((id, i) => this.repo.update(id, { sortOrder: i })));
    return this.findAllAdmin();
  }

  async remove(id: string) {
    const w = await this.findOne(id);
    const n = await this.registrations.count({ where: { workshopId: id, status: Not(RegistrationStatus.CANCELLED) } });
    if (n) throw new BadRequestException(`“${w.title}” has ${n} active registration${n === 1 ? '' : 's'}. Unpublish it instead, or cancel those first.`);
    await this.repo.remove(w);
    return { success: true };
  }
}
