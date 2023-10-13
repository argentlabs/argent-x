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
      d="m19.718 16.654-.951 1.842H1.73L0 22.02h16.998l.003-.007L24 22.008l-4.282-5.354ZM7.048 2 0 2.006l4.282 5.355.945-1.833h16.928l1.836-3.525H7.045L7.048 2ZM8.707 10.26l-1.82 3.528h8.21l1.835-3.525H8.704l.003-.003Z"
    />
  </svg>
)
export default chakra(SvgComponent)
