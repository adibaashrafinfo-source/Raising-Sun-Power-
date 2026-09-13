// lucide-react dropped brand/logo icons — these small inline SVGs cover the
// social platforms the footer links to. All use currentColor so they inherit
// the surrounding text color like any lucide icon would.
type IconProps = { className?: string }

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2s-.21-1.5-.86-2.16c-.82-.87-1.74-.87-2.16-.92C15.6 4 12 4 12 4h-.01s-3.59 0-6.57.12c-.42.05-1.34.05-2.16.92C2.6 5.7 2.4 7.2 2.4 7.2S2.18 8.96 2.18 10.7v1.6c0 1.75.22 3.5.22 3.5s.2 1.5.85 2.16c.82.87 1.9.84 2.38.94C7.4 19 12 19 12 19s3.6 0 6.58-.12c.42-.05 1.34-.05 2.16-.92.65-.66.86-2.16.86-2.16s.22-1.75.22-3.5v-1.6c0-1.75-.22-3.5-.22-3.5ZM9.9 14.3V9.1l5.4 2.6-5.4 2.6Z" />
    </svg>
  )
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.75h4v10.75H3V9.75Zm7 0h3.83v1.47h.05c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12v6.22h-4V16c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.33v6.61h-4V9.75Z" />
    </svg>
  )
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 2h-3.2v13.6a2.7 2.7 0 1 1-2.7-2.7c.24 0 .48.02.7.07V9.6a6 6 0 1 0 5.2 5.95V8.9a8.1 8.1 0 0 0 4.6 1.44V7.1a4.9 4.9 0 0 1-4.6-5.1Z" />
    </svg>
  )
}
