import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useNavCategories } from "@/lib/category-nav";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/pages/home/CategoryIcon";

/**
 * The category list for phones. The homepage no longer carries a category grid,
 * so this sheet — opened from the "Categories" tab in the bottom nav — is where
 * people browse categories on mobile. It stays mounted and slides in and out on
 * a transform so both directions are animated.
 */
export function MobileCategorySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const categories = useNavCategories();

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[80] bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Shop by category"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[81] max-h-[76vh] overflow-y-auto rounded-t-[22px] border-t border-border bg-bg px-4 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,.28)] transition-transform duration-300 ease-out lg:hidden",
          "pb-[calc(84px+env(safe-area-inset-bottom))]",
          open ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">
              Shop by category
            </span>
            <h2 className="font-heading text-lg font-extrabold text-text">
              Everything to build a power system
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close categories"
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface-2 text-text"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              onClick={onClose}
              className="flex flex-col items-center gap-2 rounded-[16px] border border-border bg-surface px-2 py-3.5 text-center no-underline shadow-[var(--shadow-sm)] active:scale-[0.97]"
            >
              <span
                className="flex size-10 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
                style={{ background: cat.tint }}
              >
                <CategoryIcon slug={cat.slug} />
              </span>
              <span className="font-heading text-[12px] font-bold leading-tight text-text">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <Link
          to="/products"
          onClick={onClose}
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm font-bold text-blue no-underline"
        >
          View all products <ArrowRight className="size-[17px]" />
        </Link>
      </aside>
    </>
  );
}
