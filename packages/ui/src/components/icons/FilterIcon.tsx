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
      d="M17.296 15.704a1.125 1.125 0 0 1 0 1.594l-4.5 4.5a1.125 1.125 0 0 1-1.594 0l-4.5-4.5a1.127 1.127 0 1 1 1.594-1.594L12 19.406l3.704-3.705a1.123 1.123 0 0 1 1.592.003Zm-9-7.406L12 4.594l3.704 3.705a1.127 1.127 0 1 0 1.594-1.594l-4.5-4.5a1.125 1.125 0 0 0-1.594 0l-4.5 4.5a1.127 1.127 0 0 0 1.594 1.594l-.002-.001Z"
    />
  </svg>
)
export default chakra(SvgComponent)
