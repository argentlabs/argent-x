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
      fill="#02BBA8"
      fillRule="evenodd"
      d="M12 9.23a6.462 6.462 0 0 0 6.462-6.46V1a1 1 0 0 1 1-1H23a1 1 0 0 1 1 1v1.77c0 6.627-5.373 12-12 12S0 9.396 0 2.77V1a1 1 0 0 1 1-1h3.538a1 1 0 0 1 1 1v1.77A6.462 6.462 0 0 0 12 9.23Z"
      clipRule="evenodd"
    />
    <path
      fill="#FF5B81"
      fillRule="evenodd"
      d="M12 14.77a6.462 6.462 0 0 0-6.461 6.46V23a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1.77c0-6.627 5.373-12 12-12s12 5.373 12 12V23a1 1 0 0 1-1 1h-3.538a1 1 0 0 1-1-1v-1.77A6.462 6.462 0 0 0 12 14.77Z"
      clipRule="evenodd"
    />
    <path
      fill="#FFAB00"
      fillRule="evenodd"
      d="M19.668 12A11.951 11.951 0 0 1 12 14.77c-2.916 0-5.589-1.04-7.668-2.77A11.951 11.951 0 0 1 12 9.23 11.95 11.95 0 0 1 19.668 12Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
