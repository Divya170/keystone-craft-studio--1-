import { load } from '@/lib/server';
import type { FaqResponse } from '@/lib/types';
import { LoadError } from '@/components/States';
import { FaqBrowser } from './FaqBrowser';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'FAQ' };

export default async function FaqPage({ searchParams }: { searchParams: { category?: string } }) {
  const all = await load<FaqResponse>('/content/faq');
  if (!all) return <LoadError what="the FAQ" />;
  const cat = searchParams.category && all.categories.includes(searchParams.category) ? searchParams.category : 'All';
  return <FaqBrowser all={all} initialCategory={cat} />;
}
