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
    <g clipPath="url(#clip0_286_10)">
      <path
        d="M10.6414 10.5065L11.9992 9.1619L13.357 10.5065L11.9992 11.8511L10.6414 10.5065Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.4245 10.5065L12.0004 3.00456L19.5762 10.5065L12.0004 18.0085L4.4245 10.5065ZM8.3605 10.5065L12.0004 14.1109L15.6402 10.5065L12.0004 6.90214L8.3605 10.5065Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.37732 10.5189L11.9998 -4.57764e-05L22.6224 10.5189L11.9998 21.0378L1.37732 10.5189ZM2.16452 10.5189L11.9998 20.2583L21.8352 10.5189L11.9998 0.779472L2.16452 10.5189Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.2226 11.5666H3.22258L1.33331 13.4375L3.22258 15.3083L10.1107 22.1292L12 24.0001L13.8893 22.1292L20.7774 15.3083L22.6666 13.4375L20.7774 11.5666L18.8881 13.4375L16.9989 15.3083L13.8893 18.3876L12 20.2584H12L10.1107 18.3876L7.00112 15.3083L5.11185 13.4375H5.11186L3.2226 11.5666Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_286_10">
        <rect width={24} height={24} fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
