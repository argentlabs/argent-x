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
      d="M10.613 16.347h2.756c.21 0 .36-.154.36-.37v-1.053c0-2.878 5.271-2.94 5.271-8.107C19 3.321 16.484 1 12.62 1 8.696 1 6 3.444 6 7.034v.464c0 .216.15.402.36.402l2.755.124c.24 0 .36-.093.36-.34v-.65c0-1.61 1.198-2.754 3.055-2.754 1.767 0 2.935 1.052 2.935 2.66 0 3.405-5.211 3.56-5.211 7.767v1.27c0 .216.15.37.359.37ZM11.9 23c1.198 0 2.097-.928 2.097-2.197 0-1.3-.869-2.166-2.097-2.166s-2.127.866-2.127 2.166c0 1.269.899 2.197 2.127 2.197Z"
      fill="#F0F0F0"
    />
  </svg>
)
export default chakra(SvgComponent)
