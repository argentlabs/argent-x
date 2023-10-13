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
      fillRule="evenodd"
      d="M12.64 6.131a1.618 1.618 0 0 0-1.28 0 1.48 1.48 0 0 0-.517.369l-6.515 7.294c-.176.2-.286.44-.318.693-.032.253.015.51.135.74.121.23.31.425.548.562.237.136.511.21.792.211H18.515c.28-.001.555-.075.792-.211a1.41 1.41 0 0 0 .548-.562c.12-.23.167-.487.135-.74a1.295 1.295 0 0 0-.318-.693l-.003-.004-6.512-7.29a1.48 1.48 0 0 0-.517-.369Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
