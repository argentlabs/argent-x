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
      d="M12.785 17.58a1.126 1.126 0 0 1 0 1.595l-.557.557a5.627 5.627 0 0 1-7.958-7.958l2.262-2.26a5.625 5.625 0 0 1 7.718-.233 1.13 1.13 0 0 1-1.5 1.688 3.375 3.375 0 0 0-4.628.138l-2.26 2.257a3.375 3.375 0 1 0 4.774 4.774l.557-.557a1.127 1.127 0 0 1 1.592 0ZM19.73 4.269a5.634 5.634 0 0 0-7.958 0l-.557.557A1.127 1.127 0 0 0 12.81 6.42l.557-.557a3.376 3.376 0 0 1 4.774 4.774l-2.26 2.261a3.375 3.375 0 0 1-4.63.134 1.129 1.129 0 1 0-1.5 1.688 5.625 5.625 0 0 0 7.716-.228l2.26-2.26a5.633 5.633 0 0 0 .004-7.96v-.003Z"
    />
  </svg>
)
export default chakra(SvgComponent)
