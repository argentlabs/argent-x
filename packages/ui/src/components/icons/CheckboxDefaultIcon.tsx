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
      d="M12 4.125a7.875 7.875 0 1 0 0 15.75 7.875 7.875 0 0 0 0-15.75ZM1.875 12C1.875 6.408 6.408 1.875 12 1.875S22.125 6.408 22.125 12 17.592 22.125 12 22.125 1.875 17.592 1.875 12Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
