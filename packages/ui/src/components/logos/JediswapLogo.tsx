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
      d="M19.7185 16.6537L18.767 18.4958L1.73039 18.4958L-2.34599e-07 22.0207L16.9982 22.0207L17.0014 22.0143L23.9999 22.0079L19.7185 16.6537Z"
      fill="currentColor"
    />
    <path
      d="M7.04768 1.99999L0.00130081 2.00647L4.28277 7.36062L5.22789 5.5281L22.1559 5.52811L23.9916 2.00323L7.04456 2.00323L7.04768 1.99999Z"
      fill="currentColor"
    />
    <path
      d="M8.70719 10.2596L6.8874 13.7877L15.0963 13.7877L16.932 10.2628L8.70407 10.2628L8.70719 10.2596Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
