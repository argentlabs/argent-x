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
    <g fill="currentColor" clipPath="url(#prefix__a)">
      <path d="M9.096 12.538 2.24 10.823V2.175L9.096 9.99v2.547ZM9.112 14.876 4.587 17.46v-3.74l4.525-.286v1.443ZM19.223 5.578l1.28-1.351v-2.01l-1.28 1.652v1.71ZM15.655 13.659l6.025.66V7.846l-6.025 3.351v2.463ZM15.653 15.7l1.931 1.278v-1.87l-1.931-.637V15.7ZM15.667 10.156l1.075-.898V6.83l-1.075 1.443v1.883ZM15.577 16.45h-1.202l1.806 2.386h2.1l-2.704-2.387ZM10.456 18.632H7.86L4.87 22.56h4.49l1.096-3.928ZM13.692 16.454h-2.096l-.513 4.554h5.077l-2.468-4.554ZM10.652 16.454h-1.45l-.738.857h1.839l.349-.857ZM11.222 7.783H9.199L7.836 5.077h3.022l.364 2.706ZM15.501 7.776h-3.284l.298-6.256h7.035l-4.049 6.256Z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="currentColor" d="M2.24 1.52h19.44v21.04H2.24z" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
