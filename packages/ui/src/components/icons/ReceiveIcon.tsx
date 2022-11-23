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
      d="M12 1.875c.621 0 1.125.504 1.125 1.125v10.784l4.83-4.83a1.125 1.125 0 0 1 1.59 1.591l-6.75 6.75a1.121 1.121 0 0 1-1.59 0l-6.75-6.75a1.125 1.125 0 0 1 1.59-1.59l4.83 4.829V3c0-.621.504-1.125 1.125-1.125ZM3.75 19.125a1.125 1.125 0 0 0 0 2.25h16.5a1.125 1.125 0 0 0 0-2.25H3.75Z"
      fill="currentColor"
    />
  </svg>
)
export default SvgComponent
