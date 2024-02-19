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
      opacity={0.3}
      d="M7 8.50588C7 7.67419 7.67419 7 8.50588 7H21.4941C22.3258 7 23 7.67419 23 8.50588V21.4941C23 22.3258 22.3258 23 21.4941 23H8.50588C7.67419 23 7 22.3258 7 21.4941V8.50588Z"
      fill="currentColor"
    />
    <path
      opacity={0.5}
      d="M20 18.4941C20 19.3258 19.3258 20 18.4941 20H5.50588C4.67422 20 4 19.3258 4 18.4941V5.50588C4 4.67422 4.67422 4 5.50588 4H18.4941C19.3258 4 20 4.67422 20 5.50588V18.4941Z"
      fill="currentColor"
    />
    <path
      opacity={0.9}
      d="M17 15.4941C17 16.3258 16.3258 17 15.4941 17H2.50588C1.67421 17 1 16.3258 1 15.4941V2.50588C1 1.6742 1.67421 1 2.50588 1H15.4941C16.3258 1 17 1.67421 17 2.50588V15.4941Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
