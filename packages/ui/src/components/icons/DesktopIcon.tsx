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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.875 6v10.125A2.625 2.625 0 0 0 4.5 18.75h6.375v1.125H9a1.125 1.125 0 0 0 0 2.25h6a1.125 1.125 0 0 0 0-2.25h-1.875V18.75H19.5a2.625 2.625 0 0 0 2.625-2.625V6A2.625 2.625 0 0 0 19.5 3.375h-15A2.625 2.625 0 0 0 1.875 6Zm18 10.125a.375.375 0 0 1-.375.375h-15a.375.375 0 0 1-.375-.375V15h15.75v1.125ZM4.125 6v6.75h15.75V6a.375.375 0 0 0-.375-.375h-15A.375.375 0 0 0 4.125 6Z"
      fill="currentColor"
    />
  </svg>
)

export default SvgComponent
