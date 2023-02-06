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
      d="M12.567 1.278a1.125 1.125 0 0 0-1.134 0l-9 5.25a1.125 1.125 0 0 0 0 1.944l9 5.25c.35.204.784.204 1.134 0l9-5.25a1.125 1.125 0 0 0 0-1.944l-9-5.25ZM12 11.448 5.233 7.5 12 3.552 18.767 7.5 12 11.448Z"
      fill="currentColor"
    />
    <path
      d="M2.028 11.433a1.125 1.125 0 0 1 1.539-.405L12 15.948l8.433-4.92a1.125 1.125 0 0 1 1.134 1.944l-9 5.25c-.35.204-.784.204-1.134 0l-9-5.25a1.125 1.125 0 0 1-.405-1.539Z"
      fill="currentColor"
    />
    <path
      d="M2.028 15.933a1.125 1.125 0 0 1 1.539-.405L12 20.448l8.433-4.92a1.125 1.125 0 0 1 1.134 1.944l-9 5.25c-.35.204-.784.204-1.134 0l-9-5.25a1.125 1.125 0 0 1-.405-1.539Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
