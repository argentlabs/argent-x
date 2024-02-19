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
      d="M22.125 11.25A10.137 10.137 0 0 0 12 1.125 10.136 10.136 0 0 0 1.875 11.25a1.125 1.125 0 0 0 .36.824l.022.019c.015.014.032.029.05.042l.018.015 8.55 6.412v1.313H10.5a1.125 1.125 0 1 0 0 2.25h3a1.125 1.125 0 1 0 0-2.25h-.375v-1.313l8.55-6.412a1.125 1.125 0 0 0 .45-.9Zm-2.33-1.125H16.84c-.168-2.744-.937-4.737-1.774-6.127a7.9 7.9 0 0 1 4.73 6.127Zm-10.38 0C9.67 6.446 11.155 4.51 12 3.692c.844.818 2.33 2.754 2.586 6.433H9.414Zm-.48-6.127C8.09 5.388 7.326 7.38 7.16 10.125H4.205a7.9 7.9 0 0 1 4.73-6.127Zm-2.56 8.377h4.5v3.375l-4.5-3.375Zm6.75 0h4.5l-4.5 3.375v-3.375Z"
    />
  </svg>
)
export default chakra(SvgComponent)
