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
      d="M13.68 1.385a1.125 1.125 0 0 0-1.774.48l-1.868 5.12-1.846-1.792a1.125 1.125 0 0 0-1.678.125C4.432 8.046 3.375 10.799 3.375 13.5a8.625 8.625 0 1 0 17.25 0c0-5.733-4.856-10.383-6.944-12.115ZM12 19.875A6.381 6.381 0 0 1 5.625 13.5c0-1.87.656-3.808 1.942-5.779l2.15 2.086a1.125 1.125 0 0 0 1.84-.422l1.894-5.193c2.054 1.959 4.924 5.398 4.924 9.308A6.381 6.381 0 0 1 12 19.875Z"
    />
  </svg>
)
export default chakra(SvgComponent)
