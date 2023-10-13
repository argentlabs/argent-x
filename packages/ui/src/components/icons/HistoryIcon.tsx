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
      d="M10.173 2.806a9.375 9.375 0 1 1-4.8 15.82 1.125 1.125 0 1 1 1.592-1.59 7.125 7.125 0 1 0 0-10.072L5.703 8.222H6.73a1.125 1.125 0 0 1 0 2.25h-3.75c-.31 0-.59-.125-.794-.328l-.002-.003-.003-.002a1.121 1.121 0 0 1-.326-.792v-3.75a1.125 1.125 0 0 1 2.25 0v1.04l1.267-1.263v-.001a9.375 9.375 0 0 1 4.8-2.567Z"
    />
    <path
      fill="currentColor"
      d="M13.125 7.5a1.125 1.125 0 0 0-2.25 0v4.478a1.14 1.14 0 0 0 .15.583 1.119 1.119 0 0 0 .431.424l3.882 2.24a1.125 1.125 0 1 0 1.124-1.95l-3.337-1.925V7.5Z"
    />
  </svg>
)
export default chakra(SvgComponent)
