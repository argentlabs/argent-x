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
      d="M7.5 2.25a1.125 1.125 0 0 0 0 2.25h12v12a1.125 1.125 0 0 0 2.25 0V3.375c0-.621-.504-1.125-1.125-1.125H7.5Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.75 6c-.621 0-1.125.504-1.125 1.125V20.25c0 .621.504 1.125 1.125 1.125h13.125c.621 0 1.125-.504 1.125-1.125V7.125C18 6.504 17.496 6 16.875 6H3.75Zm1.125 13.125V8.25H15.75v10.875H4.875Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
