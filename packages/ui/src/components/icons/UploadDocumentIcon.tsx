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
      d="M12.43 10.585c.133.055.258.137.366.244l2.625 2.625a1.125 1.125 0 0 1-1.591 1.591l-.705-.704v2.909a1.125 1.125 0 0 1-2.25 0v-2.909l-.704.705a1.125 1.125 0 0 1-1.591-1.591l2.624-2.626a1.121 1.121 0 0 1 1.227-.244Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.625 20.25a1.875 1.875 0 0 1-1.875 1.875H5.25a1.875 1.875 0 0 1-1.875-1.875V3.75A1.875 1.875 0 0 1 5.25 1.875h9c.298 0 .585.119.796.33l5.25 5.25c.21.21.329.497.329.795v12Zm-15-.375V4.125h7.125v4.5c0 .621.504 1.125 1.125 1.125h4.5v10.125H5.625ZM17.159 7.5H15V5.341L17.159 7.5Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
