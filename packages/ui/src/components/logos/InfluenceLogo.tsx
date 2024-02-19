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
    <g clipPath="url(#clip0_403_8)">
      <path
        d="M18.444 2.81608L15.8805 1.72773H13.3208L14.9726 2.43589L14.4486 2.81621L14.9726 3.19652L13.3208 3.90417H15.8805L18.444 2.81608ZM18.444 11.9998C18.444 15.5168 15.5815 18.3675 12.0502 18.3675V5.6324C15.5815 5.6324 18.444 8.48312 18.444 11.9998ZM11.9765 21.6802C6.61674 21.6802 2.25529 17.3374 2.25529 11.9998C2.25529 6.66229 6.61674 2.31948 11.9765 2.31948C12.0013 2.31948 12.0255 2.32304 12.0502 2.32674V0.000137329C5.39496 0.000137329 0 5.37296 0 11.9998C0 18.6267 5.39484 24 12.0502 24V21.6729C12.0255 21.6764 12.0013 21.6802 11.9765 21.6802Z"
        fill="currentColor"
      />
      <path
        d="M5.65628 11.9998C5.65628 8.48309 8.51906 5.6323 12.0501 5.6323V3.30794C12.0254 3.31151 12.0014 3.31542 11.9765 3.31542C7.16764 3.31542 3.25562 7.21129 3.25562 11.9998C3.25562 16.7882 7.16764 20.6839 11.9765 20.6839C12.0012 20.6844 12.0258 20.6869 12.0501 20.6916V18.3674C8.51906 18.3674 5.65628 15.5166 5.65628 11.9998Z"
        fill="url(#paint0_linear_403_8)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_403_8"
        x1={5.65627}
        y1={11.9998}
        x2={12.0237}
        y2={18.3939}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#36A7CD" />
        <stop offset={1} stopColor="#36A7CD" stopOpacity={0} />
      </linearGradient>
      <clipPath id="clip0_403_8">
        <rect width={24} height={24} fill="currentColor" />
      </clipPath>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
