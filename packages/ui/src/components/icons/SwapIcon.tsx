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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.981 3.722c.622 0 1.125.504 1.125 1.125v3.375h3.375a1.125 1.125 0 0 1 0 2.25h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5c0-.621.504-1.125 1.125-1.125Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.413 3.34a9.366 9.366 0 0 1 10.214 2.034 1.125 1.125 0 0 1-1.592 1.59 7.116 7.116 0 0 0-10.07 0l-.002.001-3.187 3.179a1.125 1.125 0 0 1-1.59-1.594l3.187-3.176v-.001a9.366 9.366 0 0 1 3.04-2.033Z"
      fill="currentColor"
    />
    <path
      d="M22.061 14.23a1.12 1.12 0 0 0-1.041-.702h-4.501a1.125 1.125 0 0 0 0 2.25h1.778l-1.26 1.257-.002.001a7.114 7.114 0 0 1-10.07 0 1.125 1.125 0 0 0-1.592 1.59 9.366 9.366 0 0 0 13.253.001h.001l1.267-1.264v1.79a1.125 1.125 0 1 0 2.25 0v-4.537"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
