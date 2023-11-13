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
    <g clipPath="url(#prefix__a)">
      <path
        fill="currentColor"
        d="m4.753 17.596-2.754 2.756 1.612 1.605 2.754-2.745-1.612-1.616Zm6.103 2.989V24h2.287v-3.415h-2.287ZM0 10.862v2.276h3.373v-2.276H0Zm3.611-8.82L2 3.649l2.754 2.745 1.612-1.605-2.754-2.745Zm15.636 4.362 2.765-2.745L20.4 2.054 17.646 4.81l1.601 1.594Zm-8.39-2.989h2.287V0h-2.288v3.415ZM5.138 12c0 3.768 3.076 6.83 6.861 6.83 3.785 0 6.861-3.062 6.861-6.83 0-3.768-3.076-6.83-6.861-6.83-3.785 0-6.861 3.062-6.861 6.83ZM24 13.138v-2.276h-3.373v2.276H24Zm-3.611 8.82L22 20.351l-2.765-2.745-1.613 1.605 2.766 2.745Z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
