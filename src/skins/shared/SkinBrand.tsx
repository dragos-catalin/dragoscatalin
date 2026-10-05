import { BrandMark } from "@/components/brand/BrandMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Logo link back to the (skinned) home. No data-intro animation: that is scoped to classic `header`. */
export function SkinBrand({ className }: { className?: string }) {
    return (
        <Link
            href="/"
            className={cn(
                "brand-link inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-pill text-fg",
                className,
            )}
        >
            <BrandMark className="size-8" />
            <Wordmark className="text-lg" />
        </Link>
    );
}
