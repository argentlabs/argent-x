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
      d="m20.296 17.296-3 3a1.126 1.126 0 1 1-1.594-1.594l1.08-1.077H4.5a1.125 1.125 0 1 1 0-2.25h12.281l-1.08-1.08a1.127 1.127 0 1 1 1.594-1.593l3 3a1.126 1.126 0 0 1 0 1.594Zm-13.594-6a1.127 1.127 0 1 0 1.594-1.594L7.219 8.625H19.5a1.125 1.125 0 0 0 0-2.25H7.219l1.077-1.08a1.127 1.127 0 1 0-1.594-1.593l-3 3a1.125 1.125 0 0 0 0 1.594l3 3Z"
    />
  </svg>
)
export default chakra(SvgComponent)
