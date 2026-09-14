import { useEffect, useState } from "react"

// Types out a string character-by-character on mount (computer-typing effect),
// leaving a blinking caret. Renders the full text instantly under
// prefers-reduced-motion.
export function Typewriter({
  text,
  className,
  speed = 32,
  startDelay = 400,
}: {
  text: string
  className?: string
  speed?: number
  startDelay?: number
}) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length)
      setDone(true)
      return
    }
    let i = 0
    let interval: ReturnType<typeof setInterval>
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(startTimer)
      clearInterval(interval)
    }
  }, [text, speed, startDelay])

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block border-r-2 align-baseline"
        style={{
          borderColor: "var(--orange-500,#f49e09)",
          animation: done ? "rsp-caret 1s step-end infinite" : "none",
        }}
      >
        &nbsp;
      </span>
    </span>
  )
}
