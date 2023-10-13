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
      d="M15.5 15.393c.625.91 1.6 1.482 2.875 1.482 1.342 0 2.352-.634 2.971-1.629.577-.928.779-2.103.779-3.246a10.125 10.125 0 1 0-4.525 8.437 1.125 1.125 0 1 0-1.244-1.874A7.875 7.875 0 1 1 19.875 12c0 .929-.173 1.629-.44 2.058-.225.362-.527.567-1.06.567s-.835-.205-1.06-.567c-.372-.597-.44-1.372-.44-2.058V8.25a1.125 1.125 0 0 0-2.202-.327A4.852 4.852 0 0 0 12 7.125 4.87 4.87 0 0 0 7.125 12a4.875 4.875 0 0 0 8.375 3.393Zm-.875-3.4a2.625 2.625 0 1 0 0 .013V11.993Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
