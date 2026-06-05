"use client";

export function Input({ label, value, onChange, type = "text", placeholder, required, disabled, className, error }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; required?: boolean; disabled?: boolean; className?: string; error?: string;
}) {
  return (
    <div className={`form-group ${className ?? ""}`}>
      {label && <label className="form-label">{label}{required && <span className="req"> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} disabled={disabled}
        className="form-input" />
      {error && <span className="form-err">{error}</span>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required, disabled, className, placeholder = "Select…" }: {
  label?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean; disabled?: boolean; className?: string; placeholder?: string;
}) {
  return (
    <div className={`form-group ${className ?? ""}`}>
      {label && <label className="form-label">{label}{required && <span className="req"> *</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} required={required} disabled={disabled} className="form-select">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, className }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; className?: string;
}) {
  return (
    <div className={`form-group ${className ?? ""}`}>
      {label && <label className="form-label">{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows} className="form-textarea" />
    </div>
  );
}
