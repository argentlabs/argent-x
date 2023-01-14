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
      d="M3 4.125c-.621 0-1.125.504-1.125 1.125V18a1.875 1.875 0 0 0 1.875 1.875h16.5A1.875 1.875 0 0 0 22.125 18V5.25c0-.621-.504-1.125-1.125-1.125H3Zm1.125 3.682v9.818h15.75V7.807L12.76 14.33c-.43.395-1.09.395-1.52 0L4.125 7.807Zm13.983-1.432H5.892L12 11.974l6.108-5.599Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
