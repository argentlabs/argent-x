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
      d="m22.87 8.688-17.25-6A1.125 1.125 0 0 0 4.124 3.75v16.5a1.125 1.125 0 0 0 2.25 0v-3.7l16.494-5.738a1.125 1.125 0 0 0 0-2.124Zm-16.495 5.48V5.332l12.7 4.417-12.7 4.418Z"
    />
  </svg>
)
export default chakra(SvgComponent)
