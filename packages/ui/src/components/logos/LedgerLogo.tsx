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
      d="M14.9726 1.56784V2.88517H22.6846V7.50932H24V1.56784H14.9726ZM0 1.56784V7.50932H1.31534V2.88517H9.02742V1.56784H0ZM9.04057 7.50932V16.5507H14.9726V15.3624H10.3558V7.50932H9.04057ZM22.6846 16.551V21.1749H14.9726V22.4922H24V16.551H22.6846ZM0 16.551V22.4925H9.02742V21.1749H1.31534V16.551H0Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
