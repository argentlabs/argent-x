import { FC, SVGProps } from "react"

export const LedgerIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_3217_31342)">
      <circle cx="20" cy="20" r="20" fill="white" />
      <path
        d="M22.9726 9.56784V10.8852H30.6846V15.5093H32V9.56784H22.9726ZM8 9.56784V15.5093H9.31534V10.8852H17.0274V9.56784H8ZM17.0406 15.5093V24.5507H22.9726V23.3624H18.3558V15.5093H17.0406ZM30.6846 24.551V29.1749H22.9726V30.4922H32V24.551H30.6846ZM8 24.551V30.4925H17.0274V29.1749H9.31534V24.551H8Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_3217_31342">
        <rect width="40" height="40" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
