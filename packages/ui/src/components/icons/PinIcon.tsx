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
      d="M15.85 12.8 18 14.725v1.5h-5.25v6.025L12 23l-.75-.75v-6.025H6v-1.5L8 12.8V4.475H6.75v-1.5H17.1v1.5h-1.25V12.8Z"
    />
  </svg>
)
export default chakra(SvgComponent)
