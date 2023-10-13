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
      d="m12 7.26 5.59 9.553H6.413L12 7.26Zm-1.857-3.202L2.216 17.61a1.577 1.577 0 0 0 0 1.593c.289.494.823.797 1.4.797h16.768a1.62 1.62 0 0 0 1.4-.797c.288-.493.288-1.1 0-1.593l-7.93-13.552A2.151 2.151 0 0 0 12 3c-.765 0-1.472.406-1.857 1.058Z"
    />
  </svg>
)
export default chakra(SvgComponent)
