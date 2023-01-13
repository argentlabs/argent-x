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
      d="M19.04 5.57A1.12 1.12 0 0 0 18 4.874H8.25a1.125 1.125 0 0 0 0 2.25h7.034l-10.08 10.08a1.125 1.125 0 0 0 1.591 1.59l10.08-10.079v7.034a1.125 1.125 0 0 0 2.25 0V6c0-.153-.03-.298-.085-.43Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
