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
      d="M13.5447 10.5061L20.6224 2.27884H18.9452L12.7996 9.42248L7.89113 2.27884H2.2298L9.65236 13.0813L2.2298 21.7089H3.90709L10.397 14.1649L15.5807 21.7089H21.242L13.5442 10.5061H13.5447ZM11.2474 13.1765L10.4953 12.1008L4.51144 3.54148H7.08766L11.9167 10.4491L12.6688 11.5248L18.946 20.5036H16.3698L11.2474 13.1769V13.1765Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
