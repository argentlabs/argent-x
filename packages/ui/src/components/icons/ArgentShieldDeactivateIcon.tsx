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
      d="M2.384 1.417a1.125 1.125 0 0 1 1.59.076l17.718 19.5a1.125 1.125 0 0 1-1.665 1.514l-2.475-2.724a14.003 14.003 0 0 1-4.95 2.955 1.8 1.8 0 0 1-1.205 0c-1.428-.476-8.772-3.337-8.772-11.985V5.25c0-.49.191-.959.532-1.309l-.849-.934a1.125 1.125 0 0 1 .076-1.59Zm2.491 4.415L12 13.673v6.894c-1.485-.518-7.125-2.942-7.125-9.814V5.832Z"
      fill="currentColor"
    />
    <path
      d="M9.131 4.5c0-.621.504-1.125 1.125-1.125H19.5a1.875 1.875 0 0 1 1.875 1.875v5.498a12.956 12.956 0 0 1-.729 4.39c-.447 1.275-1.512.611-2.123 0L12 8V5.625h-1.744A1.125 1.125 0 0 1 9.131 4.5Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
