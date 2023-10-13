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
      d="M18.375 13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M5.331 5.684a.75.75 0 0 1 .293-.059H18a1.125 1.125 0 0 0 0-2.25H5.625a3 3 0 0 0-3 3.083V18a2.625 2.625 0 0 0 2.625 2.625h15a1.875 1.875 0 0 0 1.875-1.875V9a1.875 1.875 0 0 0-1.875-1.875H5.659a.778.778 0 0 1-.784-.718v-.064a.75.75 0 0 1 .456-.659ZM4.875 18V9.274c.26.069.53.103.802.101h14.198v9H5.25A.375.375 0 0 1 4.875 18Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
