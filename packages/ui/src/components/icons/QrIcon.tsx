import { chakra } from "@chakra-ui/react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.273 3.818H3.818v5.455h5.455V3.818ZM3.818 2A1.818 1.818 0 0 0 2 3.818v7.273h9.09V2H3.819Z"
      fill="currentColor"
    />
    <path
      d="M5.182 5.182h2.727v2.727H5.182V5.182ZM5.182 16.09h2.727v2.728H5.182v-2.727ZM16.09 16.09h2.728v2.728h-2.727v-2.727ZM16.09 5.182h2.728v2.727h-2.727V5.182Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.273 14.727H3.818v5.455h5.455v-5.455ZM2 12.91v7.273C2 21.186 2.814 22 3.818 22h7.273v-9.09H2ZM20.182 3.818h-5.455v5.455h5.455V3.818ZM12.909 2v9.09H22V3.819A1.818 1.818 0 0 0 20.182 2h-7.273ZM18.364 14.727h-3.637v1.819H12.91v-3.637h5.455v1.818ZM12.909 22v-3.636h1.818V22H12.91Zm3.636 0h3.637A1.818 1.818 0 0 0 22 20.182v-1.818h-1.818v1.818h-3.636V22Zm3.637-5.454H22v-3.637h-1.818v3.636Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
