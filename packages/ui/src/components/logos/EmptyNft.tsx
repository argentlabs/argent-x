import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 28 28"
    {...props}
  >
    <rect width={28} height={28} fill="#404040" rx={4} />
    <path
      fill="#8C8C8C"
      d="M13.063 11.188a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"
    />
    <path
      fill="#8C8C8C"
      fillRule="evenodd"
      d="M7.75 6.188c-.863 0-1.563.7-1.563 1.562v12.5c0 .863.7 1.563 1.563 1.563h12.5c.863 0 1.563-.7 1.563-1.563V7.75c0-.863-.7-1.563-1.563-1.563H7.75Zm.313 1.875v7.424l1.077-1.078a1.563 1.563 0 0 1 2.22 0l1.39 1.39 3.265-3.265a1.564 1.564 0 0 1 2.22 0l1.703 1.703V8.062H8.063Zm2.187 7.888-2.188 2.187v1.8h11.876v-3.05l-2.813-2.812-3.265 3.265a1.564 1.564 0 0 1-2.22 0l-1.39-1.39Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
