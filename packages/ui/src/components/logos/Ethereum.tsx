import { chakra } from "@chakra-ui/react"
import { SVGProps } from "react"
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
      d="m11.998 0-7.5 12.223 7.5 4.353 7.499-4.354L11.998 0Z"
      fill="#fff"
    />
    <path
      d="M19.502 13.619 11.998 24l-7.5-10.381 7.5 4.352 7.504-4.352Z"
      fill="#fff"
    />
  </svg>
)
export default chakra(SvgComponent)
