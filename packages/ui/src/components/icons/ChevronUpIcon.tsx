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
      d="M11.204 6.705c.44-.44 1.152-.44 1.591 0l7.5 7.5a1.125 1.125 0 0 1-1.59 1.59L12 9.091l-6.705 6.705a1.125 1.125 0 0 1-1.59-1.591l7.5-7.5Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
