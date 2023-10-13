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
      d="M9.75 8.625c.621 0 1.125.504 1.125 1.125v6a1.125 1.125 0 0 1-2.25 0v-6c0-.621.504-1.125 1.125-1.125ZM15.375 9.75a1.125 1.125 0 0 0-2.25 0v6a1.125 1.125 0 0 0 2.25 0v-6Z"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M9.75.75a2.625 2.625 0 0 0-2.625 2.625V4.5H3.75a1.125 1.125 0 0 0 0 2.25h.375V19.5A1.875 1.875 0 0 0 6 21.375h12a1.875 1.875 0 0 0 1.875-1.875V6.75h.375a1.125 1.125 0 0 0 0-2.25h-3.375V3.375A2.625 2.625 0 0 0 14.25.75h-4.5Zm4.875 3.75V3.375A.375.375 0 0 0 14.25 3h-4.5a.375.375 0 0 0-.375.375V4.5h5.25Zm-8.25 2.25v12.375h11.25V6.75H6.375Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
