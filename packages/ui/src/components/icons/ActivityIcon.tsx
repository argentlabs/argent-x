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
      d="M3.6 7.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM8 4.4a1.2 1.2 0 0 0 0 2.4h12.8a1.2 1.2 0 0 0 0-2.4H8ZM8 10.8a1.2 1.2 0 0 0 0 2.4h12.8a1.2 1.2 0 0 0 0-2.4H8ZM6.8 18.4A1.2 1.2 0 0 1 8 17.2h12.8a1.2 1.2 0 0 1 0 2.4H8a1.2 1.2 0 0 1-1.2-1.2ZM5.2 12A1.6 1.6 0 1 1 2 12a1.6 1.6 0 0 1 3.2 0ZM5.2 18.4a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0Z"
    />
  </svg>
)
export default chakra(SvgComponent)
