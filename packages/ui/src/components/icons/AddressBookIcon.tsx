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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.905 13.532a4.125 4.125 0 1 0-6.31 0c-.67.355-1.278.82-1.795 1.378a1.125 1.125 0 0 0 1.65 1.53 4.5 4.5 0 0 1 6.6 0 1.125 1.125 0 0 0 1.65-1.53 6.75 6.75 0 0 0-1.795-1.378ZM12.75 9a1.875 1.875 0 0 0-.047 3.75h.094A1.875 1.875 0 0 0 12.75 9Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 5.25h1.125v-1.5c0-1.036.84-1.875 1.875-1.875h13.5c1.035 0 1.875.84 1.875 1.875v16.5c0 1.035-.84 1.875-1.875 1.875H6a1.875 1.875 0 0 1-1.875-1.875v-1.5H3a1.125 1.125 0 0 1 0-2.25h1.125V15H3a1.125 1.125 0 0 1 0-2.25h1.125v-1.5H3A1.125 1.125 0 0 1 3 9h1.125V7.5H3a1.125 1.125 0 0 1 0-2.25Zm16.125-1.125H6.375v15.75h12.75V4.125Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
