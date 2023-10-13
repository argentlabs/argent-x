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
      d="M13.125 3.75a1.125 1.125 0 0 0-2.25 0v7.125H3.75a1.125 1.125 0 0 0 0 2.25h7.125v7.125a1.125 1.125 0 0 0 2.25 0v-7.125h7.125a1.125 1.125 0 0 0 0-2.25h-7.125V3.75Z"
    />
  </svg>
)
export default chakra(SvgComponent)
