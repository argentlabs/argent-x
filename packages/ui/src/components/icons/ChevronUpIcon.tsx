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
      d="M11.204 6.705c.44-.44 1.152-.44 1.591 0l7.5 7.5a1.125 1.125 0 0 1-1.59 1.59L12 9.091l-6.705 6.705a1.125 1.125 0 0 1-1.59-1.591l7.5-7.5Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
