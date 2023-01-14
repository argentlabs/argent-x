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
      d="M9.27 5.419a7.116 7.116 0 0 1 7.761 1.545l.002.001 1.26 1.257H16.52a1.125 1.125 0 1 0 0 2.25h4.5c.621 0 1.125-.504 1.125-1.125v-4.5a1.125 1.125 0 0 0-2.25 0V6.64l-1.27-1.266-.001-.001a9.366 9.366 0 0 0-13.254 0 1.125 1.125 0 1 0 1.592 1.59 7.116 7.116 0 0 1 2.31-1.544ZM2.978 13.528a1.122 1.122 0 0 0-.794.328l-.008.008c-.2.203-.323.482-.323.79v4.5a1.125 1.125 0 0 0 2.25 0v-1.79l1.266 1.262v.001a9.367 9.367 0 0 0 13.255 0 1.125 1.125 0 0 0-1.593-1.59 7.115 7.115 0 0 1-10.07 0l-.002-.002-1.26-1.257h1.779a1.125 1.125 0 0 0 0-2.25h-4.5Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
