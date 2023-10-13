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
      d="m21.796 5.204-3-3a1.125 1.125 0 0 0-1.594 0l-9 9c-.21.211-.328.498-.327.796v3A1.125 1.125 0 0 0 9 16.125h3a1.125 1.125 0 0 0 .796-.33l9-9a1.125 1.125 0 0 0 0-1.59ZM18 4.594 19.406 6l-1.031 1.031-1.406-1.406L18 4.594Zm-6.469 9.281h-1.406v-1.406l5.25-5.25 1.406 1.406-5.25 5.25Zm9.844-1.447V19.5a1.875 1.875 0 0 1-1.875 1.875h-15A1.875 1.875 0 0 1 2.625 19.5v-15A1.875 1.875 0 0 1 4.5 2.625h7.072a1.125 1.125 0 0 1 0 2.25H4.875v14.25h14.25v-6.697a1.125 1.125 0 0 1 2.25 0Z"
    />
  </svg>
)
export default chakra(SvgComponent)
