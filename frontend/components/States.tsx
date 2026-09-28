'use client';

import { useRouter } from 'next/navigation';

export function LoadError({ what = 'this page' }: { what?: string }) {
  const router = useRouter();
  return (
    <div role="alert" className="max-w-content mx-auto px-[clamp(20px,4vw,48px)] py-24">
      <div className="max-w-[640px] p-[clamp(28px,4vw,48px)] rounded-[28px] bg-sand flex flex-col gap-4 items-start">
        <h1 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">We couldn’t load {what}.</h1>
        <p className="text-[17px] leading-relaxed text-body">This is usually temporary — please try again in a moment.</p>
        <button type="button" onClick={() => router.refresh()} className="min-h-[52px] px-6 rounded-full bg-clay text-cream font-semibold border-0 cursor-pointer hover:bg-clay-hover">
          Try again
        </button>
      </div>
    </div>
  );
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[clamp(14px,2vw,28px)] animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-[4/5] rounded-[20px] bg-linen" />
          <div className="h-3 w-2/5 rounded-md bg-linen" />
          <div className="h-[18px] w-[70%] rounded-md bg-linen" />
        </div>
      ))}
    </div>
  );
}
