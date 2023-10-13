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
      d="m16.315 13.327-2.87 2.85a.616.616 0 0 0 0 .876l2.194 2.173a.98.98 0 0 0 1.359 0l6.722-6.565a.925.925 0 0 0 0-1.327l-6.722-6.56a.98.98 0 0 0-1.359 0l-2.193 2.173a.616.616 0 0 0 0 .875l2.87 2.851a1.85 1.85 0 0 1 0 2.654ZM7.685 13.327l2.87 2.85a.616.616 0 0 1 0 .876L8.36 19.226a.98.98 0 0 1-1.359 0L.28 12.661a.925.925 0 0 1 0-1.327l6.722-6.56a.98.98 0 0 1 1.359 0l2.193 2.173a.616.616 0 0 1 0 .875l-2.87 2.851a1.85 1.85 0 0 0 0 2.654Z"
    />
    <path
      fill="currentColor"
      d="M8.438 12.542a.761.761 0 0 1 0-1.084l3.014-2.983a.78.78 0 0 1 1.096 0l3.015 2.983c.302.3.302.785 0 1.084l-3.015 2.983a.78.78 0 0 1-1.096 0l-3.014-2.983Z"
    />
  </svg>
)
export default chakra(SvgComponent)
