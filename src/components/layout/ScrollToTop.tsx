import { useEffect } from "react"
import { useLocation, useNavigationType } from "react-router-dom"

/**
 * Opening a page from a link should start at the top of it. React Router keeps
 * the window's scroll position across navigations, so clicking a product from
 * halfway down the homepage used to drop you halfway down the product page.
 * Back and forward are left alone — there the browser's own restored position
 * is what people expect.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === "POP") return
    // The page sets scroll-behavior: smooth for in-page anchors; jumping to a
    // new page should not animate, so it is turned off for this one move.
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = "auto"
    window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  }, [pathname, search, navigationType])

  return null
}
