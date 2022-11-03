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
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.875 5.25c0-1.036.84-1.875 1.875-1.875h16.5c1.035 0 1.875.84 1.875 1.875v13.5c0 1.035-.84 1.875-1.875 1.875H3.75a1.875 1.875 0 0 1-1.875-1.875V5.25Zm2.25 2.625v-2.25h15.75v2.25H4.125Zm15.75 2.25v8.25H4.125v-8.25h15.75Z"
      fill="currentColor"
    />
  </svg>
)

export default SvgComponent
