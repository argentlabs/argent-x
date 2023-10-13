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
      d="M15.59 3.338A9.375 9.375 0 0 0 5.375 5.373h-.001L4.106 6.638v-1.79a1.125 1.125 0 0 0-2.25 0v4.5a1.122 1.122 0 0 0 1.125 1.125h4.5a1.125 1.125 0 0 0 0-2.25H5.703l1.262-1.258a7.125 7.125 0 1 1 0 10.072 1.125 1.125 0 0 0-1.592 1.59A9.375 9.375 0 1 0 15.59 3.338Z"
    />
  </svg>
)
export default chakra(SvgComponent)
