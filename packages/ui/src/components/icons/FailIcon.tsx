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
      d="M4.896 4.786a1.142 1.142 0 0 0-.11.11A10.092 10.092 0 0 0 1.875 12c0 5.592 4.533 10.125 10.125 10.125a10.093 10.093 0 0 0 7.214-3.02A10.093 10.093 0 0 0 22.125 12c0-5.592-4.533-10.125-10.125-10.125-2.768 0-5.277 1.11-7.104 2.91Zm2.388.907a7.875 7.875 0 0 1 11.023 11.023L7.284 5.693Zm9.432 12.614A7.875 7.875 0 0 1 5.693 7.284l11.023 11.023Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
