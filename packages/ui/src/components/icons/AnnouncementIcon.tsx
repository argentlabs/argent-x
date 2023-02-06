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
      d="M17.448 21.102c.177-.217.304-.471.37-.743l1.08-4.318A4.874 4.874 0 0 0 18 6.375H14.22l-.139-.006a9.53 9.53 0 0 1-.577-.05 14.557 14.557 0 0 1-2.127-.419A16.94 16.94 0 0 1 4.95 2.522l-.006-.004a1.875 1.875 0 0 0-3.07 1.43v14.605a1.875 1.875 0 0 0 3.07 1.43l.006-.005a16.94 16.94 0 0 1 6.426-3.378c.359-.098.693-.175.998-.237v2.677a1.865 1.865 0 0 0 1.037 1.674h.002l1.745.869a1.864 1.864 0 0 0 2.289-.481Zm-2.823-2.298 1.123.559.81-3.238h-1.933v2.68ZM18 13.875a2.625 2.625 0 0 0 0-5.25h-3.375v5.25H18Zm-7.214-5.804a19.146 19.146 0 0 1-6.661-3.326v13.01a19.145 19.145 0 0 1 6.661-3.326c.59-.16 1.125-.274 1.589-.355V8.426c-.464-.08-1-.194-1.589-.355Z"
      fill="currentColor"
    />
  </svg>
)
export default chakra(SvgComponent)
