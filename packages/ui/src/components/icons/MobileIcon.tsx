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
      d="M16.5 1.125h-9A2.625 2.625 0 0 0 4.875 3.75v16.5A2.625 2.625 0 0 0 7.5 22.875h9a2.625 2.625 0 0 0 2.625-2.625V3.75A2.625 2.625 0 0 0 16.5 1.125Zm-9.375 6h9.75v9.75h-9.75v-9.75Zm.375-3.75h9a.375.375 0 0 1 .375.375v1.125h-9.75V3.75a.375.375 0 0 1 .375-.375Zm9 17.25h-9a.375.375 0 0 1-.375-.375v-1.125h9.75v1.125a.375.375 0 0 1-.375.375Z"
    />
  </svg>
)
export default chakra(SvgComponent)
