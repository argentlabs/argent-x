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
    <path
      d="M12.0001 7.26044L17.5894 16.8132H6.41426L12.0001 7.26044ZM10.143 4.05847L2.21611 17.61C1.92796 18.1031 1.92796 18.7101 2.21611 19.2034C2.50495 19.6965 3.0392 20 3.6155 20H20.384C20.961 20 21.4952 19.6965 21.7834 19.2034C22.0722 18.7101 22.0722 18.1031 21.7834 17.61L13.8531 4.05847C13.4725 3.40594 12.7611 3 12.0001 3C11.2349 3 10.5276 3.40594 10.143 4.05847Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
