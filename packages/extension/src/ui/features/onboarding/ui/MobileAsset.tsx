import { FC, SVGProps } from "react"

export const MobileAsset: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="44"
      height="92"
      viewBox="0 0 44 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="-10.75"
        y="1.72998"
        width="53.5"
        height="101.5"
        rx="6.75"
        fill="#242424"
        stroke="black"
        strokeWidth="2.5"
      />

      <rect x="18" y="10" width="16" height="16" rx="4" fill="white" />
      <path
        d="M27.4 12.96H24.6001C24.5066 12.96 24.4316 13.037 24.4296 13.1327C24.373 15.8234 22.9974 18.3773 20.6296 20.1862C20.5545 20.2436 20.5374 20.3515 20.5923 20.4292L22.2304 22.7471C22.2862 22.826 22.3947 22.8438 22.4712 22.7858C23.9517 21.6622 25.1425 20.3067 26 18.8042C26.8576 20.3067 28.0485 21.6622 29.529 22.7858C29.6053 22.8438 29.7139 22.826 29.7697 22.7471L31.4079 20.4292C31.4627 20.3515 31.4456 20.2436 31.3705 20.1862C29.0027 18.3773 27.6271 15.8234 27.5706 13.1327C27.5685 13.037 27.4935 12.96 27.4 12.96Z"
        fill="#FF875B"
      />
      <rect x="18" y="30" width="16" height="16" rx="4" fill="#616161" />
      <rect x="-2" y="30" width="16" height="16" rx="4" fill="#616161" />
      <rect x="-2" y="10" width="16" height="16" rx="4" fill="#616161" />
      <rect x="18" y="50" width="16" height="16" rx="4" fill="#616161" />
      <rect x="-2" y="50" width="16" height="16" rx="4" fill="#616161" />
      <rect x="18" y="70" width="16" height="16" rx="4" fill="#616161" />
      <rect x="-2" y="70" width="16" height="16" rx="4" fill="#616161" />
      <defs>
        <filter
          id="filter0_d_0_1"
          x="14"
          y="10"
          width="24"
          height="24"
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
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_0_1"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_0_1"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
