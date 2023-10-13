import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 58 58"
    {...props}
  >
    <path stroke="#F36A3D" strokeDasharray="2 2" d="M45 46 29 33 13 46" />
    <circle cx={29} cy={8} r={7.5} fill="#000" stroke="#666" />
    <circle cx={50} cy={50} r={7.5} fill="#000" stroke="#F36A3D" />
    <circle cx={8} cy={50} r={7.5} fill="#000" stroke="#F36A3D" />
    <circle cx={29} cy={33} r={11} fill="#F36A3D" />
    <path
      fill="#F36A3D"
      fillRule="evenodd"
      d="M11.769 47.481a.469.469 0 0 1 0 .663l-4.375 4.375a.469.469 0 0 1-.663 0l-2.187-2.188a.469.469 0 0 1 .662-.663l1.856 1.857 4.044-4.044a.469.469 0 0 1 .663 0ZM53.769 47.481a.469.469 0 0 1 0 .663l-4.375 4.375a.469.469 0 0 1-.663 0l-2.188-2.188a.469.469 0 0 1 .663-.663l1.856 1.857 4.044-4.044a.469.469 0 0 1 .663 0Z"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M33.523 29.977c.22.22.22.576 0 .796l-5.25 5.25a.562.562 0 0 1-.796 0l-2.625-2.625a.562.562 0 1 1 .796-.796l2.227 2.228 4.852-4.853c.22-.22.576-.22.796 0Z"
      clipRule="evenodd"
    />
    <path fill="#666" d="M29 11.8a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z" />
    <path
      stroke="#666"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M29 8.2a2 2 0 1 0-2-2"
    />
  </svg>
)
export default chakra(SvgComponent)
