import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 14.578A6.578 6.578 0 1 0 8 1.422a6.578 6.578 0 0 0 0 13.156ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default SvgComponent
