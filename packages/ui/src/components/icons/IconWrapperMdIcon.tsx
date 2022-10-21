import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18.222a8.222 8.222 0 1 0 0-16.444 8.222 8.222 0 0 0 0 16.444ZM20 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0s10 4.477 10 10Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default SvgComponent
