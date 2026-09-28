import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentBlock, ContentType } from './entities/content-block.entity';
import { CreateContentBlockDto, UpdateContentBlockDto } from './dto/content-block.dto';

export const FAQ_PENDING_ANSWER = 'The studio is confirming this answer — send a note in the meantime and they’ll reply directly.';

@Injectable()
export class ContentService {
  constructor(@InjectRepository(ContentBlock) private readonly repo: Repository<ContentBlock>) {}

  /**
   * Public FAQ with the comp's rules applied server-side: unanswered items are
   * flagged `pending` (and shown with the standard note); optional `q`
   * (question + answer + topic), `category` and `home` (only items marked
   * showOnHome) filters. Topics keep their first-seen order.
   */
  async findFaq(q?: string, category?: string, home?: boolean) {
    const rows = await this.findPublic(ContentType.FAQ_ITEM);
    const items = rows.map((r) => {
      const f = r.fields || {};
      const raw = String(f.answer || '').trim();
      return {
        id: r.id,
        category: String(f.category || 'General'),
        question: String(f.question || ''),
        answer: raw || FAQ_PENDING_ANSWER,
        pending: !raw,
        showOnHome: !!f.showOnHome,
      };
    });
    const categories = Array.from(new Set(items.map((i) => i.category)));
    const needle = (q || '').trim().toLowerCase();
    const filtered = items.filter(
      (i) =>
        (!home || i.showOnHome) &&
        (!category || category === 'All' || i.category === category) &&
        (!needle || `${i.question} ${i.pending ? '' : i.answer} ${i.category}`.toLowerCase().includes(needle)),
    );
    return { items: filtered, categories, total: items.length, approved: items.filter((i) => !i.pending).length };
  }

  /** Map of slot → { image, alt } for the fixed site photos. */
  async siteImages() {
    const rows = await this.findPublic(ContentType.SITE_IMAGE);
    const out: Record<string, { image: string | null; alt: string }> = {};
    for (const r of rows) if (r.fields?.slot) out[r.fields.slot] = { image: r.fields.image || null, alt: r.fields.alt || '' };
    return out;
  }

  async findPublic(type?: ContentType) {
    return this.repo.find({
      where: { published: true, ...(type ? { type } : {}) },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllAdmin(type?: ContentType) {
    return this.repo.find({
      where: type ? { type } : {},
      order: { type: 'ASC', sortOrder: 'ASC' },
    });
  }

  async findOne(id: string) {
    const block = await this.repo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Content block not found.');
    return block;
  }

  async create(dto: CreateContentBlockDto) {
    if (dto.type === ContentType.SITE_IMAGE) {
      throw new BadRequestException('Site photo slots are fixed — replace an existing slot’s image instead.');
    }
    const count = await this.repo.count({ where: { type: dto.type } });
    const block = this.repo.create({
      type: dto.type,
      fields: dto.fields,
      sortOrder: dto.sortOrder ?? count,
      published: dto.published ?? true,
    });
    return this.repo.save(block);
  }

  async update(id: string, dto: UpdateContentBlockDto) {
    const block = await this.findOne(id);
    if (dto.fields !== undefined) {
      // A site photo keeps its slot key whatever the client sends.
      block.fields = block.type === ContentType.SITE_IMAGE ? { ...dto.fields, slot: block.fields.slot } : dto.fields;
    }
    if (dto.sortOrder !== undefined) block.sortOrder = dto.sortOrder;
    if (dto.published !== undefined) block.published = dto.published;
    return this.repo.save(block);
  }

  /** Rewrites sortOrder 0..n-1 in the given id order (admin ↑/↓). */
  async reorder(ids: string[]) {
    const rows = await this.repo.find({ where: { id: In(ids) } });
    if (rows.length !== ids.length) throw new NotFoundException('Unknown content id in reorder list.');
    await Promise.all(ids.map((id, i) => this.repo.update(id, { sortOrder: i })));
    return { success: true };
  }

  async remove(id: string) {
    const block = await this.findOne(id);
    if (block.type === ContentType.SITE_IMAGE) throw new BadRequestException('Site photo slots can be replaced, not deleted.');
    await this.repo.remove(block);
    return { success: true };
  }
}
