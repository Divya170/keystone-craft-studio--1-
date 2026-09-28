import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-5">
      <div className="max-w-xl flex flex-col gap-5">
        <p className="font-hand font-semibold text-[30px] text-clay -rotate-2">oops — a dropped stitch</p>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] leading-[.98] tracking-[-0.025em]">This page isn&apos;t here.</h1>
        <p className="text-lg text-body">It may have moved, or the piece may no longer be listed.</p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/" className="inline-flex items-center min-h-[54px] px-7 rounded-full bg-clay text-cream font-semibold no-underline hover:text-cream">
            Back to home
          </Link>
          <Link href="/shop" className="inline-flex items-center min-h-[54px] px-7 rounded-full border-[1.5px] border-ink text-ink font-semibold no-underline">
            Browse the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
