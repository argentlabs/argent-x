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
      d="M6 8.625a3.375 3.375 0 0 0 0 6.75h3.75a1.125 1.125 0 0 1 0 2.25H6a5.625 5.625 0 1 1 0-11.25h3.75a1.125 1.125 0 0 1 0 2.25H6Z"
    />
    <path
      fill="currentColor"
      d="M6.375 12c0-.621.504-1.125 1.125-1.125h9a1.125 1.125 0 0 1 0 2.25h-9A1.125 1.125 0 0 1 6.375 12Z"
    />
    <path
      fill="currentColor"
      d="M14.25 6.375a1.125 1.125 0 0 0 0 2.25H18a3.375 3.375 0 1 1 0 6.75h-3.75a1.125 1.125 0 0 0 0 2.25H18a5.625 5.625 0 1 0 0-11.25h-3.75Z"
    />
  </svg>
)
export default chakra(SvgComponent)
