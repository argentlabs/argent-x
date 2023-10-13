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
      d="M7.875 12.375c0-.621.504-1.125 1.125-1.125h6a1.125 1.125 0 0 1 0 2.25H9a1.125 1.125 0 0 1-1.125-1.125ZM9 15a1.125 1.125 0 0 0 0 2.25h6A1.125 1.125 0 0 0 15 15H9Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M20.625 20.25a1.875 1.875 0 0 1-1.875 1.875H5.25a1.875 1.875 0 0 1-1.875-1.875V3.75A1.875 1.875 0 0 1 5.25 1.875h9c.298 0 .585.119.796.33l5.25 5.25c.21.21.329.497.329.795v12Zm-15-.375V4.125h7.125v4.5c0 .621.504 1.125 1.125 1.125h4.5v10.125H5.625ZM17.159 7.5H15V5.341L17.159 7.5Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
