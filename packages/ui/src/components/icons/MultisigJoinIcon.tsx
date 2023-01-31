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
      d="M14.325 14.66a6.75 6.75 0 1 0-8.4 0 11.625 11.625 0 0 0-4.705 3.368 1.125 1.125 0 1 0 1.723 1.445 9.375 9.375 0 0 1 14.364 0 1.125 1.125 0 1 0 1.724-1.446 11.626 11.626 0 0 0-4.706-3.368Zm-4.2-9.785a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
      fill="currentColor"
    />
    <path
      d="M22.125 10.875a1.125 1.125 0 0 0-2.25 0v.75h-.75a1.125 1.125 0 0 0 0 2.25h.75v.75a1.125 1.125 0 0 0 2.25 0v-.75h.75a1.125 1.125 0 0 0 0-2.25h-.75v-.75Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
