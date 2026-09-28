import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus, InquiryType } from './entities/inquiry.entity';
import { SubmitInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { newReference, validateInquiry } from '../common/form-rules';
import { clean } from '../common/utils/unique-slug';

@Injectable()
export class InquiriesService {
  constructor(@InjectRepository(Inquiry) private readonly repo: Repository<Inquiry>) {}

  async submit(dto: SubmitInquiryDto) {
    const errors = validateInquiry(dto);
    if (Object.keys(errors).length) throw new BadRequestException({ message: 'Please check the highlighted fields.', errors });
    let reference = newReference('IN');
    while (await this.repo.findOne({ where: { reference } })) reference = newReference('IN');
    const saved = await this.repo.save(
      this.repo.create({
        reference,
        name: dto.name!.trim(),
        email: dto.email!.trim(),
        type: dto.type as InquiryType,
        subject: clean(dto.ref),
        message: dto.message!.trim(),
        status: InquiryStatus.NEW,
      }),
    );
    return { success: true, reference: saved.reference, name: saved.name, email: saved.email };
  }

  async findAll(opts: { status?: string; type?: string; q?: string }) {
    const qb = this.repo.createQueryBuilder('i').orderBy('i.createdAt', 'DESC');
    if (opts.status && opts.status !== 'all') qb.andWhere('i.status = :s', { s: opts.status });
    if (opts.type && opts.type !== 'all') qb.andWhere('i.type = :t', { t: opts.type });
    const q = (opts.q || '').trim().toLowerCase();
    if (q) {
      qb.andWhere(
        "(LOWER(i.name) LIKE :q OR LOWER(i.email) LIKE :q OR LOWER(i.reference) LIKE :q OR LOWER(COALESCE(i.subject,'')) LIKE :q OR LOWER(i.message) LIKE :q)",
        { q: `%${q}%` },
      );
    }
    return qb.getMany();
  }

  countNew() {
    return this.repo.count({ where: { status: InquiryStatus.NEW } });
  }

  recent(n = 5) {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: n });
  }

  async findOne(id: string) {
    const i = await this.repo.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Inquiry not found.');
    return i;
  }

  async update(id: string, dto: UpdateInquiryDto) {
    const i = await this.findOne(id);
    if (dto.status !== undefined) i.status = dto.status;
    if (dto.adminNotes !== undefined) i.adminNotes = clean(dto.adminNotes);
    return this.repo.save(i);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { success: true };
  }
}
