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
      d="M4.875 5.625v5.128c0 6.871 5.64 9.296 7.125 9.814 1.486-.518 7.125-2.943 7.125-9.814V5.625H4.875Zm-1.7-1.7c.35-.352.828-.55 1.325-.55h15a1.875 1.875 0 0 1 1.875 1.875v5.503c0 8.648-7.344 11.51-8.772 11.985a1.8 1.8 0 0 1-1.206 0c-1.428-.476-8.772-3.337-8.772-11.985V5.25c0-.497.198-.974.55-1.326Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
