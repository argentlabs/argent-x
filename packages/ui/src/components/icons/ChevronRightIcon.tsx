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
      d="M8.204 3.704c.44-.439 1.152-.439 1.591 0l7.5 7.5c.44.44.44 1.152 0 1.591l-7.5 7.5a1.125 1.125 0 0 1-1.59-1.59L14.909 12 8.204 5.295a1.125 1.125 0 0 1 0-1.59Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
