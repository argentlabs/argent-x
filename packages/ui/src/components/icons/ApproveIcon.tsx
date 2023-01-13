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
      d="M14.296 8.67a1.125 1.125 0 0 0-1.591-1.59L5.25 14.534l-3.33-3.33a1.125 1.125 0 0 0-1.59 1.591l4.125 4.126c.439.439 1.151.439 1.59 0l8.25-8.25ZM23.67 8.67a1.125 1.125 0 0 0-1.59-1.59l-7.455 7.454-.714-.714a1.125 1.125 0 0 0-1.59 1.591l1.508 1.51c.44.439 1.152.439 1.591 0l8.25-8.25Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
