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
      d="M11.204.705a1.122 1.122 0 0 1 1.591 0l3.938 3.937a1.125 1.125 0 0 1-1.591 1.591l-2.017-2.017V12a1.125 1.125 0 0 1-2.25 0V4.216L8.858 6.233a1.125 1.125 0 0 1-1.591-1.591L11.204.705Z"
    />
    <path
      fill="currentColor"
      d="M7.5 10.5H5.625v8.625h12.75V10.5H16.5a1.125 1.125 0 0 1 0-2.25h2.25a1.875 1.875 0 0 1 1.875 1.875V19.5a1.875 1.875 0 0 1-1.875 1.875H5.25A1.875 1.875 0 0 1 3.375 19.5v-9.375A1.875 1.875 0 0 1 5.25 8.25H7.5a1.125 1.125 0 0 1 0 2.25Z"
    />
  </svg>
)
export default chakra(SvgComponent)
