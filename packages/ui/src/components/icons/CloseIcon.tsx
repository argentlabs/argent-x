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
      d="M19.546 6.045a1.125 1.125 0 0 0-1.591-1.59L12 10.409 6.045 4.454a1.125 1.125 0 0 0-1.59 1.591L10.409 12l-5.955 5.954a1.125 1.125 0 0 0 1.591 1.591L12 13.591l5.954 5.955a1.125 1.125 0 0 0 1.591-1.591L13.591 12l5.955-5.955Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
