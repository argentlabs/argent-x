import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      id="mask0_1162_20"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={1}
      width={12}
      height={22}
    >
      <path
        d="M12 22.6789V1.04587L0.542676 17.8886C0.297323 18.2493 0.462764 18.7445 0.875638 18.8853L12 22.6789Z"
        fill="#D36161"
      />
    </mask>
    <g mask="url(#mask0_1162_20)">
      <path
        d="M23.1656 19.0424L12 22.6789L0.875638 18.8854C0.462764 18.7446 0.297323 18.2493 0.542676 17.8886L11.5437 1.71654C11.7625 1.39498 12.2367 1.3955 12.4547 1.71755L23.508 18.044C23.7544 18.4079 23.5834 18.9063 23.1656 19.0424Z"
        fill="url(#paint0_linear_1162_20)"
      />
    </g>
    <mask
      id="mask1_1162_20"
      style={{
        maskType: "alpha",
      }}
      maskUnits="userSpaceOnUse"
      x={12}
      y={1}
      width={12}
      height={22}
    >
      <path
        d="M12 22.6789V1.04587L23.508 18.044C23.7544 18.4078 23.5834 18.9063 23.1656 19.0424L12 22.6789Z"
        fill="currentColor"
      />
    </mask>
    <g mask="url(#mask1_1162_20)">
      <path
        d="M23.1656 19.0424L12 22.6789L0.875638 18.8854C0.462764 18.7446 0.297323 18.2493 0.542676 17.8886L11.5437 1.71654C11.7625 1.39498 12.2367 1.3955 12.4547 1.71755L23.508 18.044C23.7544 18.4079 23.5834 18.9063 23.1656 19.0424Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_1162_20"
        x1={12.0249}
        y1={1.47569}
        x2={12.0249}
        y2={22.6789}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="currentColor" />
        <stop offset={1} stopColor="#D9D9D9" stopOpacity={0.63} />
      </linearGradient>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
