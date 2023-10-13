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
    <g fill="currentColor" clipPath="url(#prefix__a)">
      <path d="M10.641 10.507 12 9.162l1.358 1.345-1.358 1.344-1.358-1.345Z" />
      <path
        fillRule="evenodd"
        d="M4.425 10.507 12 3.005l7.576 7.502L12 18.009l-7.575-7.502Zm3.936 0L12 14.11l3.64-3.604L12 6.902l-3.64 3.605Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M1.377 10.519 12 0l10.622 10.519L12 21.038 1.377 10.518Zm.788 0L12 20.259l9.835-9.74L12 .779l-9.835 9.74Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="m3.223 11.567-1.89 1.87 1.89 1.871 6.888 6.821L12 24l1.89-1.87 6.887-6.822 1.89-1.87-1.89-1.871-1.889 1.87-1.89 1.871-3.109 3.08L12 20.258l-1.89-1.87-3.109-3.08-1.89-1.87-1.888-1.871Z"
        clipRule="evenodd"
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
