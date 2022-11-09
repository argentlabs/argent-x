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
      d="M8.25 10.125C8.25 9.504 8.754 9 9.375 9H15a1.125 1.125 0 0 1 0 2.25H9.375a1.125 1.125 0 0 1-1.125-1.125ZM9.375 12.75a1.125 1.125 0 0 0 0 2.25H15a1.125 1.125 0 0 0 0-2.25H9.375Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.375 21.375H4.478a1.837 1.837 0 0 1-1.853-1.853v-7.897a9.75 9.75 0 1 1 9.75 9.75Zm0-17.25a7.5 7.5 0 0 0-7.5 7.5v7.5h7.5a7.5 7.5 0 0 0 0-15Z"
      fill="currentColor"
    />
  </svg>
)

export default SvgComponent
