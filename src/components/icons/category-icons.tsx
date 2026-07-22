import type { ReactNode } from "react";
import type { ProgramCategoryId } from "@/lib/constants/categories";

type IconProps = { className?: string };

function IconWrap({ children, className = "h-10 w-10" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`} aria-hidden>
      {children}
    </span>
  );
}

const icons: Record<ProgramCategoryId, (props: IconProps) => ReactNode> = {
  "artificial-intelligence": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <rect x="8" y="8" width="24" height="24" rx="3" stroke="#1a365d" strokeWidth="1.5" />
        <path d="M14 14h12M14 20h12M14 26h8" stroke="#1a365d" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="32" cy="14" r="2" fill="#c9a227" />
        <circle cx="32" cy="26" r="2" fill="#c9a227" />
      </svg>
    </IconWrap>
  ),
  "stem-engineering": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path
          d="M20 6c-4 6-8 10-8 16a8 8 0 1016 0c0-6-4-10-8-16z"
          stroke="#276749"
          strokeWidth="1.5"
        />
        <path d="M16 18c2 4 6 8 4 12M24 18c-2 4-6 8-4 12" stroke="#276749" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
  "college-credit-pre-college": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M8 28V14l12-6 12 6v14l-12 6-12-6z" stroke="#1a365d" strokeWidth="1.5" />
        <path d="M20 8v24M8 14l12 6 12-6" stroke="#1a365d" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
  "marine-science": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path
          d="M4 24c6-4 10-2 14 0s10 4 18 0M4 30c6-4 10-2 14 0s10 4 18 0"
          stroke="#2c5282"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </IconWrap>
  ),
  "writing-humanities": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M10 8h16v24H10V8z" stroke="#1a365d" strokeWidth="1.5" />
        <path d="M14 14h8M14 20h8M14 26h5" stroke="#1a365d" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26 28l4 4" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </IconWrap>
  ),
  "traditional-camp": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M20 8L8 28h24L20 8z" stroke="#b7791f" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 28v4h12v-4" stroke="#b7791f" strokeWidth="1.5" />
        <circle cx="20" cy="32" r="2" fill="#c53030" opacity="0.6" />
      </svg>
    </IconWrap>
  ),
  "outdoor-wilderness": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M6 32L16 12l6 10 4-8 8 18H6z" stroke="#4a5568" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M28 32V20l4 6" stroke="#276749" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
  "cultural-exchange": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <circle cx="20" cy="20" r="12" stroke="#1a365d" strokeWidth="1.5" />
        <ellipse cx="20" cy="20" rx="5" ry="12" stroke="#1a365d" strokeWidth="1.5" />
        <path d="M8 20h24M20 8v24" stroke="#1a365d" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
  "leadership-gifted": ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M12 14h16v4H12v-4zM14 18v8h12v-8" stroke="#c9a227" strokeWidth="1.5" />
        <path d="M16 26h8v4H16v-4z" stroke="#1a365d" strokeWidth="1.5" />
        <path d="M20 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke="#c9a227" strokeWidth="1.2" />
      </svg>
    </IconWrap>
  ),
  mathematics: ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <text x="8" y="28" fill="#1a365d" fontSize="22" fontFamily="serif">
          π
        </text>
      </svg>
    </IconWrap>
  ),
  biomedical: ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <path d="M12 32V16l8-6 8 6v16" stroke="#1a365d" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="4" stroke="#276749" strokeWidth="1.5" />
        <path d="M20 10v4" stroke="#1a365d" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
  arts: ({ className }) => (
    <IconWrap className={className}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full">
        <ellipse cx="20" cy="24" rx="10" ry="6" stroke="#1a365d" strokeWidth="1.5" />
        <circle cx="14" cy="20" r="2" fill="#c53030" />
        <circle cx="20" cy="18" r="2" fill="#c9a227" />
        <circle cx="26" cy="20" r="2" fill="#2c5282" />
        <path d="M28 14l4-2v8l-4-2" stroke="#1a365d" strokeWidth="1.5" />
      </svg>
    </IconWrap>
  ),
};

export function CategoryIcon({
  categoryId,
  className,
}: {
  categoryId: ProgramCategoryId;
  className?: string;
}) {
  const Icon = icons[categoryId];
  return Icon({ className });
}
