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
      d="M18.375 7.125a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m12.046 17.296.738-.739a7.874 7.874 0 1 0-5.659-7.56c-.003.753.105 1.5.318 2.22l-5.238 5.237c-.211.212-.33.498-.33.796V21c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125v-1.125H9c.621 0 1.125-.504 1.125-1.125v-1.125h1.125c.298 0 .585-.119.796-.33Zm.801-13.493A5.625 5.625 0 1 1 15 14.625h-.004a5.466 5.466 0 0 1-2.084-.404l-.425 1.041-.795-.795-.908.908H9c-.621 0-1.125.504-1.125 1.125v1.125H6.75c-.621 0-1.125.504-1.125 1.125v1.125h-1.5v-2.159l5.408-5.408c.32-.32.417-.8.246-1.22a5.466 5.466 0 0 1-.404-2.084V9a5.625 5.625 0 0 1 3.472-5.197Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
