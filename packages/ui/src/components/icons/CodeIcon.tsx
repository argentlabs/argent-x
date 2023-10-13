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
      d="M16.057 4.134a1.125 1.125 0 0 0-2.114-.768l-6 16.5a1.125 1.125 0 0 0 2.114.768l6-16.5ZM6.864 7.53a1.125 1.125 0 0 1-.144 1.584L3.257 12l3.463 2.886a1.125 1.125 0 1 1-1.44 1.728l-4.5-3.75a1.125 1.125 0 0 1 0-1.728l4.5-3.75a1.125 1.125 0 0 1 1.584.144ZM17.136 7.53a1.125 1.125 0 0 1 1.584-.144l4.5 3.75a1.125 1.125 0 0 1 0 1.728l-4.5 3.75a1.125 1.125 0 0 1-1.44-1.728L20.743 12 17.28 9.114a1.125 1.125 0 0 1-.144-1.584Z"
    />
  </svg>
)
export default chakra(SvgComponent)
