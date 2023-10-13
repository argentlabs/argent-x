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
      d="M10.875 8.625a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M4.5 2.625c-1.036 0-1.875.84-1.875 1.875v15c0 1.035.84 1.875 1.875 1.875h15c1.035 0 1.875-.84 1.875-1.875v-15c0-1.036-.84-1.875-1.875-1.875h-15Zm.375 2.25v8.909l1.293-1.293a1.876 1.876 0 0 1 2.664 0L10.5 14.16l3.918-3.918a1.875 1.875 0 0 1 2.664 0l2.043 2.043V4.875H4.875ZM7.5 14.341l-2.625 2.625v2.159h14.25v-3.659l-3.375-3.375-3.918 3.918a1.876 1.876 0 0 1-2.664 0L7.5 14.34Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
