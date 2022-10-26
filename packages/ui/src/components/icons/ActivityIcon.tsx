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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.514.5c.447.229.688.727.59 1.22L14.79 8.284l5.104 1.914a1.125 1.125 0 0 1 .427 1.82l-10.5 11.25a1.125 1.125 0 0 1-1.925-.988l1.312-6.562-5.104-1.914a1.125 1.125 0 0 1-.427-1.82l10.5-11.25a1.125 1.125 0 0 1 1.336-.234ZM6.47 12.286l4.424 1.66c.516.193.816.733.708 1.274l-.723 3.616 6.65-7.124-4.425-1.66a1.125 1.125 0 0 1-.708-1.274l.723-3.616-6.65 7.124Z"
      fill="currentColor"
    />
  </svg>
)

export default SvgComponent
