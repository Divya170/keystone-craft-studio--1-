import { mediaUrl } from '@/lib/api';
import { toneFor } from '@/lib/ui';

/**
 * Fills its positioned parent with a photo, or — when none has been supplied
 * yet — the comp's striped placeholder with an optional "PHOTO · …" note.
 */
export function Photo({
  src,
  alt,
  note,
  toneKey,
  className = '',
  imgClassName = '',
  eager = false,
}: {
  src?: string | null;
  alt: string;
  note?: string;
  toneKey?: string | number;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const url = mediaUrl(src);
  if (!url) {
    return (
      <div role="img" aria-label={alt || 'Photo to come'} className={`absolute inset-0 ${toneFor(toneKey ?? alt)} flex items-end p-4 ${className}`}>
        {note && <span className="font-mono text-xs leading-[1.4] text-[#3F3229] bg-cream/80 px-3 py-2 rounded-lg">PHOTO · {note}</span>}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} className={`absolute inset-0 w-full h-full object-cover ${className} ${imgClassName}`} />
  );
}
