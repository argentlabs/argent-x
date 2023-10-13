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
      d="m11.998 0-7.5 12.223 7.5 4.353 7.499-4.354L11.998 0Z"
    />
    <path
      fill="currentColor"
      d="M19.502 13.619 11.998 24l-7.5-10.381 7.5 4.352 7.504-4.352Z"
    />
  </svg>
)
export default chakra(SvgComponent)
