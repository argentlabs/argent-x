import { chakra } from "@chakra-ui/react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m11.954 5.205 2.464-2.464-.004.004.006-.006-.002.002a1.875 1.875 0 0 1 2.664 0l4.177 4.177a1.875 1.875 0 0 1 0 2.664l-2.463 2.463-8.785 8.785-.002.002a1.864 1.864 0 0 1-1.32.543h-.002.004H4.5A1.875 1.875 0 0 1 2.625 19.5v-4.19c0-.073.007-.145.02-.216l.056-.284c.029-.146.086-.284.167-.407l.16-.241c.042-.062.09-.12.142-.173l8.784-8.784ZM14.341 6l1.409-1.409 3.659 3.659L18 9.659 14.341 6Zm2.068 5.25-7.875 7.875H4.875v-3.659l7.875-7.875 3.659 3.659Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
