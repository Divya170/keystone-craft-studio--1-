import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Availability, Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { clean, uniqueSlug } from '../common/utils/unique-slug';

export type ProductSort = 'featured' | 'az' | 'za';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  /** Visible = published product in a published category. */
  private visible() {
    return this.repo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.category', 'c')
      .where('p.published = 1')
      .andWhere('c.published = 1');
  }

  /**
   * Shop listing: search (product or category name), category (slug),
   * availability and sort, all on the API. Also returns the per-category
   * counts for the sidebar and which optional filters have data (the comp:
   * "availability … filters appear automatically once that data exists").
   */
  async shop(opts: { q?: string; category?: string; availability?: string; sort?: string }) {
    const all = await this.visible().getMany();
    const q = (opts.q || '').trim().toLowerCase();
    const sort: ProductSort = ['az', 'za'].includes(opts.sort || '') ? (opts.sort as ProductSort) : 'featured';

    const matchesQ = (p: Product) => !q || `${p.name} ${p.category?.name || ''} ${p.materials || ''}`.toLowerCase().includes(q);
    const matchesAvail = (p: Product) => !opts.availability || p.availability === opts.availability;
    const base = all.filter((p) => matchesQ(p) && matchesAvail(p));

    let items = base.filter((p) => !opts.category || opts.category === 'all' || p.category?.slug === opts.category);
    items = [...items].sort((a, b) => {
      if (sort === 'az') return a.name.localeCompare(b.name);
      if (sort === 'za') return b.name.localeCompare(a.name);
      return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder;
    });

    const cats = await this.categories.find({ where: { published: true }, order: { sortOrder: 'ASC' } });
    return {
      items,
      total: items.length,
      categories: cats.map((c) => ({ slug: c.slug, name: c.name, count: base.filter((p) => p.categoryId === c.id).length })),
      allCount: base.length,
      availabilityOptions: Object.values(Availability).filter((a) => all.some((p) => p.availability === a)),
      catalogueSize: all.length,
    };
  }

  /** Home "Featured pieces": up to 5 featured (the first one is the large tile). */
  async featured() {
    const rows = await this.visible().andWhere('p.featured = 1').orderBy('p.sortOrder', 'ASC').take(5).getMany();
    return rows;
  }

  async bySlug(slug: string) {
    const product = await this.visible().andWhere('p.slug = :slug', { slug }).getOne();
    if (!product) throw new NotFoundException('Product not found.');
    const related = await this.visible()
      .andWhere('p.categoryId = :cid', { cid: product.categoryId })
      .andWhere('p.id != :id', { id: product.id })
      .orderBy('p.sortOrder', 'ASC')
      .take(4)
      .getMany();
    return { product, related };
  }

  // ───────── Admin ─────────

  async findAllAdmin(q?: string, categoryId?: string) {
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.category', 'c').orderBy('p.sortOrder', 'ASC');
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    const needle = (q || '').trim().toLowerCase();
    if (needle) qb.andWhere('(LOWER(p.name) LIKE :q OR LOWER(COALESCE(c.name, \'\')) LIKE :q)', { q: `%${needle}%` });
    return qb.getMany();
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!p) throw new NotFoundException('Product not found.');
    return p;
  }

  private async assertCategory(id: string) {
    if (!(await this.categories.findOne({ where: { id } }))) {
      throw new BadRequestException({ message: 'Choose a category.', errors: { categoryId: 'Choose a category.' } });
    }
  }

  private cleanImages(images?: { url: string; alt?: string; label?: string }[]) {
    return (images || []).filter((i) => i.url).map((i) => ({ url: i.url, alt: (i.alt || '').trim(), label: (i.label || '').trim() || undefined }));
  }

  async create(dto: CreateProductDto) {
    await this.assertCategory(dto.categoryId);
    const saved = await this.repo.save(
      this.repo.create({
        name: dto.name.trim(),
        slug: await uniqueSlug(this.repo, dto.name, undefined, 'product'),
        categoryId: dto.categoryId,
        description: clean(dto.description),
        price: dto.price ?? null,
        availability: dto.availability ?? null,
        materials: clean(dto.materials),
        images: this.cleanImages(dto.images),
        featured: dto.featured ?? false,
        published: dto.published ?? false,
        sortOrder: await this.repo.count(),
      }),
    );
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const p = await this.findOne(id);
    if (dto.name !== undefined && dto.name.trim() !== p.name) {
      p.name = dto.name.trim();
      p.slug = await uniqueSlug(this.repo, p.name, p.id, 'product');
    }
    if (dto.categoryId !== undefined) {
      await this.assertCategory(dto.categoryId);
      p.categoryId = dto.categoryId;
      p.category = undefined as any; // let TypeORM use categoryId
    }
    if (dto.description !== undefined) p.description = clean(dto.description);
    if (dto.materials !== undefined) p.materials = clean(dto.materials);
    if (dto.price !== undefined) p.price = dto.price;
    if (dto.availability !== undefined) p.availability = dto.availability;
    if (dto.images !== undefined) p.images = this.cleanImages(dto.images);
    if (dto.featured !== undefined) p.featured = dto.featured;
    if (dto.published !== undefined) p.published = dto.published;
    await this.repo.save(p);
    return this.findOne(id);
  }

  async reorder(ids: string[]) {
    if ((await this.repo.count({ where: { id: In(ids) } })) !== ids.length) throw new BadRequestException('Unknown product id in reorder list.');
    await Promise.all(ids.map((id, i) => this.repo.update(id, { sortOrder: i })));
    return this.findAllAdmin();
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { success: true };
  }

  countPublished() {
    return this.visible().getCount();
  }
}
