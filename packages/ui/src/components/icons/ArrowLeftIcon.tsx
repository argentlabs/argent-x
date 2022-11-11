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
      d="m11.296 6.045-4.83 4.83 4.83-4.83ZM2.952 12.793a1.122 1.122 0 0 1-.242-.362l.242.362ZM2.71 12.43Z"
      fill="currentColor"
    />
    <path
      d="M11.296 6.045a1.125 1.125 0 0 0-1.591-1.59l-6.753 6.752a1.126 1.126 0 0 0 0 1.586l6.752 6.753a1.125 1.125 0 0 0 1.591-1.591l-4.829-4.83H20.25a1.125 1.125 0 0 0 0-2.25H6.466l4.83-4.83Z"
      fill="currentColor"
    />
  </svg>
)
export default SvgComponent
