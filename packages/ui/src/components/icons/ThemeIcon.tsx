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
    <path fill="currentColor" d="M12 18.75a6.75 6.75 0 0 0 0-13.5v13.5Z" />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.167 3.27A10.5 10.5 0 0 1 12 1.5 10.512 10.512 0 0 1 22.5 12 10.5 10.5 0 1 1 6.167 3.27Zm1.296 15.52A8.166 8.166 0 0 0 12 20.167 8.175 8.175 0 0 0 20.167 12a8.166 8.166 0 1 0-12.704 6.79Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
