export default function SwarmLogo({ size = 48, className = '', onClick }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={`swarm-logo-mark ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path
        d="M 28 10 H 90 L 66 36 H 32 V 46 L 74 60 V 90 H 10 L 34 64 H 68 V 54 L 26 40 V 10 Z"
        fill="currentColor"
      />
    </svg>
  )
}
