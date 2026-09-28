import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { clean, uniqueSlug } from '../common/utils/unique-slug';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  private async counts(publishedOnly: boolean) {
    const qb = this.products.createQueryBuilder('p').select('p.categoryId', 'id').addSelect('COUNT(*)', 'n').groupBy('p.categoryId');
    if (publishedOnly) qb.where('p.published = 1');
    const rows: { id: string; n: string }[] = await qb.getRawMany();
    return new Map(rows.map((r) => [r.id, Number(r.n)]));
  }

  async findPublic() {
    const [rows, counts] = await Promise.all([this.repo.find({ where: { published: true }, order: { sortOrder: 'ASC' } }), this.counts(true)]);
    return rows.map((c) => ({ ...c, productCount: counts.get(c.id) || 0 }));
  }

  async findAllAdmin() {
    const [rows, counts] = await Promise.all([this.repo.find({ order: { sortOrder: 'ASC' } }), this.counts(false)]);
    return rows.map((c) => ({ ...c, productCount: counts.get(c.id) || 0 }));
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Category not found.');
    return c;
  }

  async create(dto: CreateCategoryDto) {
    return this.repo.save(
      this.repo.create({
        name: dto.name.trim(),
        slug: await uniqueSlug(this.repo, dto.name, undefined, 'category'),
        description: clean(dto.description),
        image: clean(dto.image),
        imageAlt: clean(dto.imageAlt),
        published: dto.published ?? false,
        sortOrder: await this.repo.count(),
      }),
    );
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const c = await this.findOne(id);
    if (dto.name !== undefined && dto.name.trim() !== c.name) {
      c.name = dto.name.trim();
      c.slug = await uniqueSlug(this.repo, c.name, c.id, 'category');
    }
    for (const k of ['description', 'image', 'imageAlt'] as const) if (dto[k] !== undefined) c[k] = clean(dto[k]);
    if (dto.published !== undefined) c.published = dto.published;
    return this.repo.save(c);
  }

  async reorder(ids: string[]) {
    if ((await this.repo.count({ where: { id: In(ids) } })) !== ids.length) throw new BadRequestException('Unknown category id in reorder list.');
    await Promise.all(ids.map((id, i) => this.repo.update(id, { sortOrder: i })));
    return this.findAllAdmin();
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    const n = await this.products.count({ where: { categoryId: id } });
    if (n) throw new BadRequestException(`“${c.name}” still has ${n} product${n === 1 ? '' : 's'} — move or delete them first.`);
    await this.repo.remove(c);
    return { success: true };
  }
}
