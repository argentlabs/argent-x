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
        d="M11.25 3.75V1.5a.75.75 0 1 1 1.5 0v2.25a.75.75 0 1 1-1.5 0ZM12 6a6 6 0 1 0 6 6 6.006 6.006 0 0 0-6-6Zm-6.53.53a.75.75 0 1 0 1.06-1.06l-1.5-1.5a.75.75 0 1 0-1.06 1.06l1.5 1.5Zm0 10.94-1.5 1.5a.75.75 0 1 0 1.06 1.06l1.5-1.5a.751.751 0 0 0-1.06-1.06ZM18 6.75a.75.75 0 0 0 .53-.22l1.5-1.5a.75.75 0 1 0-1.06-1.06l-1.5 1.5A.75.75 0 0 0 18 6.75Zm.53 10.72a.75.75 0 1 0-1.06 1.06l1.5 1.5a.75.75 0 1 0 1.06-1.06l-1.5-1.5ZM4.5 12a.75.75 0 0 0-.75-.75H1.5a.75.75 0 1 0 0 1.5h2.25A.75.75 0 0 0 4.5 12Zm7.5 7.5a.75.75 0 0 0-.75.75v2.25a.75.75 0 1 0 1.5 0v-2.25a.75.75 0 0 0-.75-.75Zm10.5-8.25h-2.25a.75.75 0 1 0 0 1.5h2.25a.75.75 0 1 0 0-1.5Z"
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
