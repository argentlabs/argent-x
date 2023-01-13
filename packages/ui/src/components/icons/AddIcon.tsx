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
      d="M13.125 3.75a1.125 1.125 0 0 0-2.25 0v7.125H3.75a1.125 1.125 0 0 0 0 2.25h7.125v7.125a1.125 1.125 0 0 0 2.25 0v-7.125h7.125a1.125 1.125 0 0 0 0-2.25h-7.125V3.75Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
