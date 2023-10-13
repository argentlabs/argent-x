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
      d="M17.869 12.64a1.618 1.618 0 0 0 0-1.28 1.48 1.48 0 0 0-.369-.517l-7.294-6.515c-.2-.176-.44-.286-.693-.318a1.25 1.25 0 0 0-.74.135c-.23.121-.425.31-.562.548-.136.237-.21.511-.211.792V18.515c.001.28.075.555.211.792.137.237.332.427.562.548.23.12.487.167.74.135.254-.032.494-.142.693-.318l.004-.003 7.29-6.512a1.48 1.48 0 0 0 .369-.517Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
