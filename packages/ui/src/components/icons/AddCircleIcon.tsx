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
      d="M12 1.875A10.125 10.125 0 1 0 22.125 12 10.137 10.137 0 0 0 12 1.875Zm0 18A7.875 7.875 0 1 1 19.875 12 7.883 7.883 0 0 1 12 19.875ZM16.875 12a1.125 1.125 0 0 1-1.125 1.125h-2.625v2.625a1.125 1.125 0 1 1-2.25 0v-2.625H8.25a1.125 1.125 0 1 1 0-2.25h2.625V8.25a1.125 1.125 0 1 1 2.25 0v2.625h2.625A1.125 1.125 0 0 1 16.875 12Z"
    />
  </svg>
)
export default chakra(SvgComponent)
