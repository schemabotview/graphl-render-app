// The GraphL mark — an orange rounded square with a white "G" (arc + bar/leg).
// Also the app favicon (public/icon.svg). Coral is the constant channel identity,
// independent of a concept's accent.
export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="GraphL">
      <rect width="512" height="512" rx="80" fill="#e8804f" />
      <g fill="none" stroke="#ffffff" strokeWidth="58" strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M 373 200 A 130 130 0 1 0 373 312" />
        <path d="M 283 312 L 373 312 L 373 410" />
      </g>
    </svg>
  )
}
