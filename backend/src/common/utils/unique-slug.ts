import { Not, Repository } from 'typeorm';
import { slugify } from './slugify';

/** slugify(name) made unique within `repo` (appends -2, -3 …). */
export async function uniqueSlug(repo: Repository<any>, name: string, exceptId?: string, fallback = 'item') {
  const base = slugify(name) || fallback;
  let slug = base;
  let n = 2;
  while (await repo.findOne({ where: { slug, ...(exceptId ? { id: Not(exceptId) } : {}) } })) slug = `${base}-${n++}`;
  return slug;
}

export const clean = (v?: string | null) => (typeof v === 'string' && v.trim() ? v.trim() : null);
