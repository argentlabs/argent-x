import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
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
      d="M11.998 0L4.49847 12.2225L11.998 16.5764L19.4966 12.2225L11.998 0Z"
      fill="currentColor"
    />
    <path
      d="M19.5016 13.6188L11.998 24L4.49844 13.6188L11.998 17.9707L19.5016 13.6188Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
