import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    {...props}
  >
    <path
      d="M16.902 10.564a1.125 1.125 0 0 0-1.554-1.628l-4.726 4.508-1.97-1.882a1.125 1.125 0 1 0-1.554 1.626l2.747 2.625a1.125 1.125 0 0 0 1.553.001l5.504-5.25Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 1.875C6.408 1.875 1.875 6.408 1.875 12S6.408 22.125 12 22.125 22.125 17.592 22.125 12 17.592 1.875 12 1.875ZM4.125 12a7.875 7.875 0 1 1 15.75 0 7.875 7.875 0 0 1-15.75 0Z"
      fill="currentColor"
    />
  </svg>
)
export default SvgComponent
