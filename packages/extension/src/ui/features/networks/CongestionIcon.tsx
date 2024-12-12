import type { FC } from "react"

export const CongestionIcon: FC = () => (
  <svg
    width="220"
    height="220"
    viewBox="0 0 220 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="110" cy="110" r="90" fill="#5C5B59" />
    <g clipPath="url(#clip0_1593_21542)">
      <rect x="69.6638" width="80" height="220" rx="16" fill="#323232" />
      <g filter="url(#filter0_di_1593_21542)">
        <circle cx="109.521" cy="110.118" r="24" fill="#FFB800" />
      </g>
      <circle
        cx="109.521"
        cy="174.118"
        r="24"
        fill="#479D4F"
        fillOpacity="0.5"
      />
      <circle
        cx="109.521"
        cy="46.1184"
        r="24"
        fill="#CA3E37"
        fillOpacity="0.7"
      />
    </g>
    <defs>
      <filter
        id="filter0_di_1593_21542"
        x="65.5215"
        y="66.1184"
        width="88"
        height="88"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="10" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1 0 0 0 0 0.722543 0 0 0 0 0 0 0 0 1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1593_21542"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_1593_21542"
          result="shape"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="5" />
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0 0 0 0 1 0"
        />
        <feBlend
          mode="normal"
          in2="shape"
          result="effect2_innerShadow_1593_21542"
        />
      </filter>
      <clipPath id="clip0_1593_21542">
        <rect x="69.6638" width="80" height="220" rx="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
