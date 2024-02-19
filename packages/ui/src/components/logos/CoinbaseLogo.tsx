import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_528_40)">
      <path
        d="M12.0225 18C8.7013 18 6.01125 15.315 6.01125 12C6.01125 8.685 8.7013 6 12.0225 6C14.9981 6 17.4677 8.165 17.9436 11H24C23.489 4.84 18.3243 0 12.0225 0C5.3851 0 0 5.375 0 12C0 18.625 5.3851 24 12.0225 24C18.3243 24 23.489 19.16 24 13H17.9436C17.4677 15.835 14.9981 18 12.0225 18Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_528_40">
        <rect width={24} height={24} rx={12} fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
