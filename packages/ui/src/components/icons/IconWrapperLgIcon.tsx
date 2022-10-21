import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21.867c5.45 0 9.867-4.418 9.867-9.867 0-5.45-4.418-9.867-9.867-9.867-5.45 0-9.867 4.418-9.867 9.867 0 5.45 4.418 9.867 9.867 9.867ZM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default SvgComponent
