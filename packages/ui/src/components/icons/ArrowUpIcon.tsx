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
      d="M11.207 2.952c.107-.107.23-.187.362-.242l-.362.242Z"
      fill="currentColor"
    />
    <path d="M12.793 2.952a1.122 1.122 0 0 0-1.224-.242" fill="currentColor" />
    <path
      d="M11.207 2.952a1.122 1.122 0 0 1 1.586 0l6.753 6.752a1.125 1.125 0 0 1-1.591 1.591l-4.83-4.829V20.25a1.125 1.125 0 0 1-2.25 0V6.466l-4.83 4.83a1.125 1.125 0 0 1-1.59-1.591l6.752-6.753Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
