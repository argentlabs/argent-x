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
      d="M15.375 14.25a1.125 1.125 0 0 0 0 2.25h3a1.125 1.125 0 0 0 0-2.25h-3ZM9 15.375c0-.621.504-1.125 1.125-1.125h1.5a1.125 1.125 0 0 1 0 2.25h-1.5A1.125 1.125 0 0 1 9 15.375Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1.125 6c0-1.036.84-1.875 1.875-1.875h18c1.035 0 1.875.84 1.875 1.875v12c0 1.035-.84 1.875-1.875 1.875H3A1.875 1.875 0 0 1 1.125 18V6Zm2.25 1.96V6.374h17.25v1.584H3.375Zm17.25 2.25v7.415H3.375v-7.416h17.25Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
