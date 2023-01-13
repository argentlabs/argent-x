import { chakra } from "@chakra-ui/react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.5 14.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.5 4.875v2.25h-3c-1.036 0-1.875.84-1.875 1.875v10.5c0 1.035.84 1.875 1.875 1.875h15c1.035 0 1.875-.84 1.875-1.875V9c0-1.036-.84-1.875-1.875-1.875h-3v-2.25a4.5 4.5 0 1 0-9 0Zm4.5-2.25a2.25 2.25 0 0 0-2.25 2.25v2.25h4.5v-2.25A2.25 2.25 0 0 0 12 2.625Zm-7.125 6.75h14.25v9.75H4.875v-9.75Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
