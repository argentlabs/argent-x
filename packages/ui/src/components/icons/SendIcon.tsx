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
      fillRule="evenodd"
      d="M5.288 1.49a1.875 1.875 0 0 0-2.672 2.273L5.552 12l-2.936 8.236v.001a1.875 1.875 0 0 0 2.672 2.273l15.835-8.87.003-.001a1.875 1.875 0 0 0 0-3.278l-.003-.002-15.83-8.866-.005-.003Zm14.74 10.835.55-.981-.544.984-.006-.003ZM5.07 3.947 19.448 12 5.07 20.053l2.47-6.928h5.21a1.125 1.125 0 0 0 0-2.25H7.54L5.07 3.947Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
