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
      d="M17.625 4.125a3 3 0 0 0-.75.094v-.094a3 3 0 0 0-5.7-1.313 3 3 0 0 0-4.05 2.813v4.765a3 3 0 0 0-4.875 3.44c2.983 6.289 4.814 9.045 9.75 9.045a8.635 8.635 0 0 0 8.625-8.625V7.125a3 3 0 0 0-3-3Zm.75 10.125A6.383 6.383 0 0 1 12 20.625c-3.36 0-4.66-1.313-7.732-7.794a1.33 1.33 0 0 0-.043-.081.75.75 0 0 1 1.299-.75l.02.033 1.75 2.812a1.125 1.125 0 0 0 2.081-.595V5.625a.75.75 0 0 1 1.5 0v5.625a1.125 1.125 0 1 0 2.25 0V4.125a.75.75 0 1 1 1.5 0v7.125a1.125 1.125 0 1 0 2.25 0V7.125a.75.75 0 1 1 1.5 0v7.125Z"
    />
  </svg>
)
export default chakra(SvgComponent)
