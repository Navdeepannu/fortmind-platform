export function FortMindMark({ className }: { className?: string }) {
  return (
    <div>
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M2 5h8l5 6v16H8V16l-6-6V5Zm20 0h8v5l-6 6v11h-7V11l5-6Z" />
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.035em] group-data-[collapsible=icon]:hidden">
        FortMind
      </span>
    </div>
  );
}
