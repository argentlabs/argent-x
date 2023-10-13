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
      d="M11.207 2.952c.107-.107.23-.187.362-.242l-.362.242Z"
    />
    <path fill="currentColor" d="M12.793 2.952a1.122 1.122 0 0 0-1.224-.242" />
    <path
      fill="currentColor"
      d="M11.207 2.952a1.122 1.122 0 0 1 1.586 0l6.753 6.752a1.125 1.125 0 0 1-1.591 1.591l-4.83-4.829V20.25a1.125 1.125 0 0 1-2.25 0V6.466l-4.83 4.83a1.125 1.125 0 0 1-1.59-1.591l6.752-6.753Z"
    />
  </svg>
)
export default chakra(SvgComponent)
