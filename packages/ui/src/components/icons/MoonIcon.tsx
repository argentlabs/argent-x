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
      d="M22.082 14.082a9.83 9.83 0 0 1-3.469 4.96A9.75 9.75 0 0 1 3 11.25a9.665 9.665 0 0 1 1.957-5.861 9.829 9.829 0 0 1 4.96-3.469.75.75 0 0 1 .938.937A8.258 8.258 0 0 0 21.15 13.151a.75.75 0 0 1 .938.938l-.005-.007Z"
    />
  </svg>
)
export default chakra(SvgComponent)
