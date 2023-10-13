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
      d="M8.204 3.704c.44-.439 1.152-.439 1.591 0l7.5 7.5c.44.44.44 1.152 0 1.591l-7.5 7.5a1.125 1.125 0 0 1-1.59-1.59L14.909 12 8.204 5.295a1.125 1.125 0 0 1 0-1.59Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
