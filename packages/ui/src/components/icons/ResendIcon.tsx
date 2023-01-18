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
      d="M9.27 5.417a7.125 7.125 0 0 1 7.765 1.547l.002.001 1.26 1.257H16.52a1.125 1.125 0 0 0 0 2.25h4.5c.621 0 1.125-.504 1.125-1.125v-4.5a1.125 1.125 0 1 0-2.25 0v1.79l-1.267-1.263-.001-.001a9.375 9.375 0 1 0 .001 13.253 1.125 1.125 0 0 0-1.592-1.59A7.125 7.125 0 1 1 9.27 5.416Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
