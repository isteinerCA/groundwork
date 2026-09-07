import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

export function ExploreSummerLogo({
  className,
  imageClassName,
  subtitle,
  priority = false,
}: {
  className?: string;
  imageClassName?: string;
  subtitle?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex flex-col no-underline", className)}>
      <Image
        src="/images/explore-summer-logo.png"
        alt={SITE_NAME}
        width={963}
        height={200}
        priority={priority}
        className={cn("h-7 w-auto sm:h-8", imageClassName)}
      />
      {subtitle ? (
        <span className="mt-1 text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
          {subtitle}
        </span>
      ) : null}
    </Link>
  );
}
