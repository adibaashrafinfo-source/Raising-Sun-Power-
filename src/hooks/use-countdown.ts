import { useEffect, useState } from "react"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const days = Math.floor(secondsLeft / 86400)
  const hours = Math.floor((secondsLeft % 86400) / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60

  return [
    { label: "Days", val: pad(days) },
    { label: "Hours", val: pad(hours) },
    { label: "Mins", val: pad(minutes) },
    { label: "Secs", val: pad(seconds) },
  ]
}
