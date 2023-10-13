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
      d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.769 9.769 0 0 0 12 2.25Zm4.64 8.044-5.493 5.25a.76.76 0 0 1-.525.206.722.722 0 0 1-.516-.206L7.36 12.919a.75.75 0 1 1 1.032-1.088l2.23 2.128 4.988-4.753a.75.75 0 0 1 1.032 1.088Z"
    />
  </svg>
)
export default chakra(SvgComponent)
