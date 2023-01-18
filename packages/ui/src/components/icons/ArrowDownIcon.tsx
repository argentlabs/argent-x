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
      d="M13.125 3.75a1.125 1.125 0 0 0-2.25 0v13.784l-4.83-4.83a1.125 1.125 0 0 0-1.59 1.591l6.75 6.75a1.122 1.122 0 0 0 1.592-.001l6.748-6.748a1.125 1.125 0 0 0-1.59-1.591l-4.83 4.829V3.75Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
