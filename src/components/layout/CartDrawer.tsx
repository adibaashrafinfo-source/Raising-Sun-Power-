import { Minus, Plus, X } from "lucide-react"
import { Link } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { Button } from "@/components/ui/button"
import { formatBDT } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isCartOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const increment = useCartStore((s) => s.incrementItem)
  const decrement = useCartStore((s) => s.decrementItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.subtotal())

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={closeCart}
        className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[3px]"
      />
      <aside className="fixed inset-y-0 right-0 z-[91] flex w-full max-w-[420px] flex-col border-l border-border bg-bg shadow-[var(--shadow)]">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="font-heading text-lg font-extrabold text-text">
            Your cart{" "}
            <span className="text-sm font-semibold text-muted">
              ({items.reduce((a, i) => a + i.qty, 0)})
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-[10px] border border-border bg-surface-2 text-text"
          >
            <X className="size-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="py-10 text-center text-muted">
              <div className="mb-1.5 text-[15px] font-semibold text-text">Your cart is empty</div>
              <div className="text-[13px]">Add products to get started.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[14px] border border-border bg-surface p-3"
                >
                  <span
                    className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[11px]"
                    style={item.thumbnail.kind === "art" ? { background: item.thumbnail.tint } : undefined}
                  >
                    {item.thumbnail.kind === "art" ? (
                      <ProductArt art={item.thumbnail.art} className="size-[38px]" />
                    ) : (
                      <img src={item.thumbnail.src} alt={item.name} className="size-full object-cover" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[13.5px] font-semibold leading-tight text-text">
                      {item.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-[10px] border border-border">
                        <button
                          onClick={() => decrement(item.id)}
                          className="flex size-7 items-center justify-center bg-surface-2 text-text"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-7 text-center text-[13px] font-semibold tabular-nums text-text">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => increment(item.id)}
                          className="flex size-7 items-center justify-center bg-surface-2 text-text"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="font-heading text-sm font-extrabold tabular-nums text-orange-500">
                        {formatBDT(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove"
                    className="self-start text-muted hover:text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-surface p-5">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="text-sm text-muted">Subtotal</span>
            <span className="font-heading text-xl font-extrabold tabular-nums text-text">
              {formatBDT(subtotal)}
            </span>
          </div>
          <div className="flex gap-2.5">
            <Button asChild variant="secondary" size="lg" className="flex-1" onClick={closeCart}>
              <Link to="/cart">View Cart</Link>
            </Button>
            <Button asChild size="lg" className="flex-[1.4]" onClick={closeCart}>
              <Link to="/checkout">Checkout →</Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
