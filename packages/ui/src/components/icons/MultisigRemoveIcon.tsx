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
      d="M14.325 14.66a6.75 6.75 0 1 0-8.4 0 11.625 11.625 0 0 0-4.705 3.368 1.125 1.125 0 1 0 1.723 1.445 9.375 9.375 0 0 1 14.364 0 1.125 1.125 0 1 0 1.724-1.446 11.626 11.626 0 0 0-4.706-3.368Zm-4.2-9.785a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      d="M18 12.75c0-.621.504-1.125 1.125-1.125h3.75a1.125 1.125 0 0 1 0 2.25h-3.75A1.125 1.125 0 0 1 18 12.75Z"
    />
  </svg>
)
export default chakra(SvgComponent)
