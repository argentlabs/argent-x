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
      d="M10.5 16.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM12.732 6.447a3.75 3.75 0 0 0-4.482 3.678 1.125 1.125 0 0 0 2.25 0 1.5 1.5 0 1 1 1.5 1.5 1.125 1.125 0 0 0 0 2.25 3.75 3.75 0 0 0 .732-7.428Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.875 12C1.875 6.408 6.408 1.875 12 1.875S22.125 6.408 22.125 12 17.592 22.125 12 22.125 1.875 17.592 1.875 12ZM12 4.125a7.875 7.875 0 1 0 0 15.75 7.875 7.875 0 0 0 0-15.75Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
