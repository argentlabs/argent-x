import { chakra } from "@chakra-ui/react"
import type { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.892 19.125H4.59a1.875 1.875 0 0 1-1.617-2.813c.502-.868 1.17-2.615 1.17-5.812 0-1.18.063-2.475.6-3.772a7.866 7.866 0 0 1 7.31-4.853h.002c4.991.038 7.801 4.33 7.801 8.625 0 3.197.669 4.944 1.17 5.811l.001.002a1.875 1.875 0 0 1-1.617 2.812h-3.302a4.125 4.125 0 0 1-8.216 0ZM9.88 4.545a5.616 5.616 0 0 1 2.16-.42c3.39.026 5.566 2.917 5.566 6.375 0 3.041.552 5.062 1.177 6.375H5.218c.625-1.313 1.177-3.334 1.177-6.375 0-1.123.069-2.044.428-2.91A5.616 5.616 0 0 1 9.88 4.544Zm.283 14.58a1.875 1.875 0 0 0 3.674 0h-3.674Z"
      clipRule="evenodd"
    />
  </svg>
)
export default chakra(SvgComponent)
