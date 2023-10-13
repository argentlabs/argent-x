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
        d="m18.444 2.816-2.563-1.088h-2.56l1.652.708-.524.38.524.38-1.652.708h2.56l2.563-1.088Zm0 9.184c0 3.517-2.862 6.367-6.394 6.367V5.633c3.531 0 6.394 2.851 6.394 6.368Zm-6.467 9.68c-5.36 0-9.722-4.343-9.722-9.68 0-5.338 4.362-9.68 9.721-9.68.025 0 .05.003.074.007V0C5.395 0 0 5.373 0 12s5.395 12 12.05 12v-2.327c-.025.003-.049.007-.074.007Z"
      />
      <path
        fill="url(#prefix__b)"
        d="M5.656 12c0-3.517 2.863-6.368 6.394-6.368V3.308c-.025.004-.049.007-.074.007-4.808 0-8.72 3.896-8.72 8.685 0 4.788 3.912 8.684 8.72 8.684.025 0 .05.003.074.008v-2.325c-3.53 0-6.394-2.85-6.394-6.367Z"
      />
    </g>
    <defs>
      <linearGradient
        id="prefix__b"
        x1={5.656}
        x2={12.024}
        y1={12}
        y2={18.394}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#36A7CD" />
        <stop offset={1} stopColor="#36A7CD" stopOpacity={0} />
      </linearGradient>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
