import { FC, SVGProps } from "react"

export const ChevronDown: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_3442_37728)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.292511 2.4854C0.657694 2.14913 1.22286 2.17639 1.55484 2.54629L6 7.49919L10.4452 2.54629C10.7771 2.17639 11.3423 2.14913 11.7075 2.48541C12.0727 2.82168 12.0996 3.39416 11.7676 3.76406L6.66122 9.45371C6.49186 9.64242 6.25177 9.75 6 9.75C5.74823 9.75 5.50814 9.64242 5.33878 9.45371L0.2324 3.76406C-0.0995844 3.39416 -0.0726718 2.82168 0.292511 2.4854Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_3442_37728">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
