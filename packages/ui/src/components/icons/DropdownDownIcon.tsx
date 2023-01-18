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
      d="M12.64 17.869a1.618 1.618 0 0 1-1.28 0 1.48 1.48 0 0 1-.517-.369l-6.515-7.294c-.176-.2-.286-.44-.318-.693a1.25 1.25 0 0 1 .135-.74c.121-.23.31-.425.548-.562.237-.136.511-.21.792-.211H18.515c.28.001.555.075.792.211.237.137.427.332.548.562.12.23.167.487.135.74a1.295 1.295 0 0 1-.318.693l-.003.004-6.512 7.29a1.48 1.48 0 0 1-.517.369Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
