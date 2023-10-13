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
      d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm-.75 5.25a.75.75 0 1 1 1.5 0v5.25a.75.75 0 1 1-1.5 0V7.5Zm.75 9.75A1.125 1.125 0 1 1 12 15a1.125 1.125 0 0 1 0 2.25Z"
    />
  </svg>
)
export default chakra(SvgComponent)
