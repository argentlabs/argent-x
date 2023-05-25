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
      d="M20.748 7.45c.013.194.013.388.013.584 0 5.964-4.54 12.842-12.842 12.842v-.003A12.778 12.778 0 0 1 1 18.849a9.064 9.064 0 0 0 6.68-1.87 4.52 4.52 0 0 1-4.217-3.135c.677.13 1.374.104 2.038-.077a4.514 4.514 0 0 1-3.62-4.425v-.057c.627.35 1.33.544 2.048.565a4.52 4.52 0 0 1-1.397-6.027 12.81 12.81 0 0 0 9.302 4.716 4.518 4.518 0 0 1 7.692-4.117c1.01-.2 1.98-.57 2.866-1.096a4.53 4.53 0 0 1-1.984 2.497A8.977 8.977 0 0 0 23 5.113a9.17 9.17 0 0 1-2.252 2.337Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
