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
      d="M13.125 8.25c0-.621.504-1.125 1.125-1.125h3c.621 0 1.125.504 1.125 1.125v3a1.125 1.125 0 0 1-2.25 0V9.375H14.25a1.125 1.125 0 0 1-1.125-1.125ZM6.75 11.625c.621 0 1.125.504 1.125 1.125v1.875H9.75a1.125 1.125 0 0 1 0 2.25h-3a1.125 1.125 0 0 1-1.125-1.125v-3c0-.621.504-1.125 1.125-1.125Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.75 3.375c-1.036 0-1.875.84-1.875 1.875v13.5c0 1.035.84 1.875 1.875 1.875h16.5c1.035 0 1.875-.84 1.875-1.875V5.25c0-1.036-.84-1.875-1.875-1.875H3.75Zm.375 15V5.625h15.75v12.75H4.125Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
