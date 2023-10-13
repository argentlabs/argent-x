import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M14.296 4.455a1.125 1.125 0 0 0-1.591 1.59l4.829 4.83H3.75a1.125 1.125 0 0 0 0 2.25h13.784l-4.83 4.83a1.125 1.125 0 0 0 1.591 1.59l6.75-6.749.008-.008a1.12 1.12 0 0 0 .237-1.219 1.12 1.12 0 0 0-.245-.365m0 0-6.75-6.75 6.75 6.75Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
