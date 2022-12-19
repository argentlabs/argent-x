import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="96"
    height="96"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_2865_9310)">
      <rect
        x="20"
        y="16"
        width="56"
        height="56"
        rx="16"
        fill="#28282C"
        shapeRendering="crispEdges"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48 30.5C40.5442 30.5 34.5 36.5442 34.5 44C34.5 51.4558 40.5442 57.5 48 57.5C55.4558 57.5 61.5 51.4558 61.5 44C61.5 36.5442 55.4558 30.5 48 30.5ZM43.3447 34.5858C40.3086 36.09 38.1041 39.0197 37.6063 42.5H41.5388C41.6843 39.7027 42.2335 37.1435 43.0856 35.154C43.1683 34.9609 43.2546 34.7713 43.3447 34.5858ZM52.6553 34.5858C52.7454 34.7713 52.8317 34.9609 52.9144 35.154C53.7665 37.1435 54.3157 39.7027 54.4612 42.5H58.3937C57.8959 39.0197 55.6914 36.09 52.6553 34.5858ZM51.4567 42.5C51.3142 40.0509 50.8298 37.9067 50.1567 36.335C49.7518 35.3898 49.3083 34.7207 48.8922 34.3097C48.4825 33.9051 48.1827 33.825 48 33.825C47.8173 33.825 47.5175 33.9051 47.1078 34.3097C46.6917 34.7207 46.2482 35.3898 45.8433 36.335C45.1702 37.9067 44.6858 40.0509 44.5433 42.5H51.4567ZM44.5433 45.5H51.4567C51.3142 47.9491 50.8298 50.0933 50.1567 51.6649C49.7518 52.6102 49.3083 53.2793 48.8922 53.6903C48.4825 54.0949 48.1827 54.175 48 54.175C47.8173 54.175 47.5175 54.0949 47.1078 53.6903C46.6917 53.2793 46.2482 52.6102 45.8433 51.6649C45.1702 50.0933 44.6858 47.9491 44.5433 45.5ZM41.5388 45.5H37.6063C38.1041 48.9803 40.3086 51.91 43.3447 53.4142C43.2547 53.2287 43.1683 53.0391 43.0856 52.846C42.2335 50.8565 41.6843 48.2973 41.5388 45.5ZM52.6553 53.4142C52.7453 53.2287 52.8317 53.0391 52.9144 52.846C53.7664 50.8565 54.3157 48.2973 54.4612 45.5H58.3937C57.8959 48.9803 55.6914 51.91 52.6553 53.4142Z"
        fill="#58585B"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_2865_9310"
        x="0"
        y="0"
        width="96"
        height="96"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="10" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_2865_9310"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_2865_9310"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default SvgComponent
