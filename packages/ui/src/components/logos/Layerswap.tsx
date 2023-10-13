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
      d="M7 8.506C7 7.674 7.674 7 8.506 7h12.988C22.326 7 23 7.674 23 8.506v12.988c0 .832-.674 1.506-1.506 1.506H8.506A1.506 1.506 0 0 1 7 21.494V8.506Z"
      opacity={0.3}
    />
    <path
      fill="currentColor"
      d="M20 18.494c0 .832-.674 1.506-1.506 1.506H5.506A1.506 1.506 0 0 1 4 18.494V5.506C4 4.674 4.674 4 5.506 4h12.988C19.326 4 20 4.674 20 5.506v12.988Z"
      opacity={0.5}
    />
    <path
      fill="currentColor"
      d="M17 15.494c0 .832-.674 1.506-1.506 1.506H2.506A1.506 1.506 0 0 1 1 15.494V2.506C1 1.674 1.674 1 2.506 1h12.988C16.326 1 17 1.674 17 2.506v12.988Z"
      opacity={0.9}
    />
  </svg>
)
export default chakra(SvgComponent)
