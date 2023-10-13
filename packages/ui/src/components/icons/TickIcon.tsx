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
      d="M21.046 5.955c.439.439.439 1.151 0 1.59l-10.5 10.5c-.44.44-1.152.44-1.591 0l-5.25-5.25a1.125 1.125 0 0 1 1.59-1.59l4.455 4.454 9.704-9.704c.44-.44 1.152-.44 1.591 0Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
