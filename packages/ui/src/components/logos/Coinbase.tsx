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
        d="M12.023 18a6.004 6.004 0 0 1-6.012-6c0-3.315 2.69-6 6.012-6a6.006 6.006 0 0 1 5.92 5H24c-.511-6.16-5.676-11-11.977-11C5.385 0 0 5.375 0 12s5.385 12 12.023 12C18.324 24 23.489 19.16 24 13h-6.056a6.006 6.006 0 0 1-5.921 5Z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <rect width={24} height={24} fill="currentColor" rx={12} />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
