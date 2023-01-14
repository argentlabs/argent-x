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
      d="M11.204 1.454c.44-.439 1.152-.439 1.591 0l9 9A1.125 1.125 0 0 1 21 12.375h-3.375v.75c0 .621-.504 1.125-1.125 1.125h-9a1.125 1.125 0 0 1-1.125-1.125v-.75H3a1.125 1.125 0 0 1-.795-1.92l9-9ZM15.375 12v-.75c0-.621.504-1.125 1.125-1.125h1.784L12 3.841l-6.284 6.284H7.5c.621 0 1.125.504 1.125 1.125V12h6.75Z"
      fill="currentColor"
    />
    <path
      d="M6.375 19.875c0-.621.504-1.125 1.125-1.125h9a1.125 1.125 0 0 1 0 2.25h-9a1.125 1.125 0 0 1-1.125-1.125ZM7.5 15.375a1.125 1.125 0 0 0 0 2.25h9a1.125 1.125 0 0 0 0-2.25h-9Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
