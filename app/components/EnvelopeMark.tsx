/** Simple envelope logo mark. Inherits color via `currentColor`. */
export function EnvelopeMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Print Template"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect x="3" y="7" width="26" height="18" rx="2.5" />
      <path d="M4 8.5 16 17 28 8.5" />
    </svg>
  );
}
