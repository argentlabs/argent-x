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
      d="M3.704 8.204c.44-.439 1.152-.439 1.591 0L12 14.91l6.704-6.705a1.125 1.125 0 0 1 1.591 1.591l-7.5 7.5c-.439.44-1.151.44-1.59 0l-7.5-7.5a1.125 1.125 0 0 1 0-1.59Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
