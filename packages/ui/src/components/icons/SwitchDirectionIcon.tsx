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
      d="M7.5 3.375c.621 0 1.125.504 1.125 1.125v12.284l1.08-1.08a1.125 1.125 0 0 1 1.59 1.591l-3 3a1.121 1.121 0 0 1-1.59 0l-3-3a1.125 1.125 0 0 1 1.59-1.59l1.08 1.079V4.5c0-.621.504-1.125 1.125-1.125ZM15.704 3.704a1.122 1.122 0 0 1 1.591 0l3 3a1.125 1.125 0 0 1-1.59 1.592l-1.08-1.08V19.5a1.125 1.125 0 0 1-2.25 0V7.216l-1.08 1.08a1.125 1.125 0 0 1-1.59-1.591l3-3Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
