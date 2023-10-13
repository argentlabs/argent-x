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
      d="M10.875 20.25a1.125 1.125 0 0 1-1.125 1.125H4.5A1.875 1.875 0 0 1 2.625 19.5v-15A1.875 1.875 0 0 1 4.5 2.625h5.25a1.125 1.125 0 0 1 0 2.25H4.875v14.25H9.75a1.125 1.125 0 0 1 1.125 1.125Zm10.17-9.046-3.75-3.75a1.127 1.127 0 1 0-1.593 1.594l1.83 1.827H9.75a1.125 1.125 0 1 0 0 2.25h7.781l-1.83 1.83a1.127 1.127 0 1 0 1.594 1.593l3.75-3.75a1.126 1.126 0 0 0 0-1.594Z"
    />
  </svg>
)
export default chakra(SvgComponent)
