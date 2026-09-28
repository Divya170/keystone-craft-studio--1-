import { field } from '@/lib/ui';

interface Base {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
}

function Label({ id, label, required, optional }: Base) {
  return (
    <label htmlFor={id} className="font-semibold text-[15px] leading-[1.2]">
      {label}{' '}
      {required && (
        <span aria-hidden className="text-clay">
          *
        </span>
      )}
      {optional && <span className="font-normal text-muted">(optional)</span>}
    </label>
  );
}

function Err({ id, error }: { id: string; error?: string }) {
  return error ? (
    <span id={`${id}-err`} className="font-semibold text-sm leading-[1.4] text-err">
      ⚠ {error}
    </span>
  ) : null;
}

const border = (error?: string) => ({ borderColor: error ? '#9E2F1B' : '#CDBDA8' });

export function TextField(
  p: Base & { value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; inputMode?: 'email' | 'text' },
) {
  return (
    <div className="flex flex-col gap-2">
      <Label {...p} />
      <input
        id={p.id}
        type={p.type || 'text'}
        autoComplete={p.autoComplete}
        inputMode={p.inputMode}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        aria-invalid={p.error ? 'true' : 'false'}
        aria-describedby={p.error ? `${p.id}-err` : undefined}
        aria-required={p.required || undefined}
        className={field}
        style={border(p.error)}
      />
      <Err id={p.id} error={p.error} />
    </div>
  );
}

export function TextArea(p: Base & { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Label {...p} />
      <textarea
        id={p.id}
        rows={p.rows || 5}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        aria-invalid={p.error ? 'true' : 'false'}
        aria-describedby={p.error ? `${p.id}-err` : undefined}
        aria-required={p.required || undefined}
        className={`${field} py-3.5 leading-normal resize-y`}
        style={border(p.error)}
      />
      <Err id={p.id} error={p.error} />
    </div>
  );
}

export function SelectField(p: Base & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label {...p} />
      <select
        id={p.id}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        aria-invalid={p.error ? 'true' : 'false'}
        aria-describedby={p.error ? `${p.id}-err` : undefined}
        aria-required={p.required || undefined}
        className={`${field} px-3.5 cursor-pointer`}
        style={border(p.error)}
      >
        {p.placeholder !== undefined && <option value="">{p.placeholder}</option>}
        {p.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Err id={p.id} error={p.error} />
    </div>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="px-4 py-3.5 rounded-xl bg-err-bg text-err-text font-semibold text-[15px] leading-[1.4]">
      {children}
    </p>
  );
}
