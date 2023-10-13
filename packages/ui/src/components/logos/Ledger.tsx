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
      d="M14.973 1.568v1.317h7.712V7.51H24V1.568h-9.027ZM0 1.568v5.941h1.315V2.885h7.712V1.568H0Zm9.04 5.941v9.042h5.933v-1.189h-4.617V7.51H9.04Zm13.645 9.042v4.624h-7.712v1.317H24v-5.941h-1.315ZM0 16.551v5.942h9.027v-1.318H1.315V16.55H0Z"
    />
  </svg>
)
export default chakra(SvgComponent)
