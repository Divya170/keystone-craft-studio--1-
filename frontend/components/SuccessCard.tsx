import Link from 'next/link';

interface Action {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'outline' | 'link';
}

/** Shown after every successful form submission: confirmation, the
 * server-issued reference, and a clear next step. */
export function SuccessCard({ title, children, reference, actions }: { title: string; children?: React.ReactNode; reference?: string; actions: Action[] }) {
  const cls = (a: Action) =>
    a.variant === 'link'
      ? 'inline-flex items-center min-h-[52px] px-2 font-semibold text-[15px] text-ink'
      : 'inline-flex items-center min-h-[52px] px-6 rounded-full border-[1.5px] border-ink bg-transparent cursor-pointer font-semibold text-[15px] text-ink no-underline hover:bg-ink hover:text-paper transition-colors';
  return (
    <div role="status" className="flex flex-col gap-[18px] animate-rise">
      <span aria-hidden className="w-14 h-14 rounded-full bg-moss text-paper grid place-items-center font-semibold text-2xl">
        ✓
      </span>
      <h3 className="font-display text-[34px] leading-[1.08]">{title}</h3>
      {children && <div className="text-[17px] leading-relaxed text-body flex flex-col gap-3">{children}</div>}
      {reference && (
        <p className="self-start font-mono text-sm px-4 py-2.5 rounded-xl bg-linen">
          Reference: <strong>{reference}</strong>
        </p>
      )}
      <div className="flex flex-wrap gap-3 mt-1">
        {actions.map((a) =>
          a.href ? (
            <Link key={a.label} href={a.href} className={cls(a)}>
              {a.label}
            </Link>
          ) : (
            <button key={a.label} type="button" onClick={a.onClick} className={cls(a)}>
              {a.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
