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
      d="M4.174 3C3.526 3 3 3.526 3 4.174v5.87c0 .648.526 1.173 1.174 1.173h5.87c.648 0 1.173-.525 1.173-1.174v-5.87c0-.647-.525-1.173-1.174-1.173h-5.87Zm1.174 5.87V5.348H8.87V8.87H5.348ZM13.957 3c-.649 0-1.174.526-1.174 1.174v5.87c0 .648.525 1.173 1.174 1.173h5.87c.647 0 1.173-.525 1.173-1.174v-5.87C21 3.527 20.474 3 19.826 3h-5.87Zm1.173 5.87V5.348h3.522V8.87H15.13ZM3 13.957c0-.649.526-1.174 1.174-1.174h5.87c.648 0 1.173.525 1.173 1.174v5.87c0 .647-.525 1.173-1.174 1.173h-5.87A1.174 1.174 0 0 1 3 19.826v-5.87Zm2.348 1.173v3.522H8.87V15.13H5.348ZM13.957 12.783c-.649 0-1.174.525-1.174 1.174v5.87c0 .647.525 1.173 1.174 1.173h5.87c.647 0 1.173-.526 1.173-1.174v-5.87c0-.648-.526-1.173-1.174-1.173h-5.87Zm1.173 5.87V15.13h3.522v3.522H15.13Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
