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
    <mask
      id="mask0_1003_16"
      style={{
        maskType: "luminance",
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={24}
      height={24}
    >
      <path d="M0 0H24V24H0V0Z" fill="white" />
    </mask>
    <g mask="url(#mask0_1003_16)">
      <path
        d="M12 24C18.6276 24 24 18.6276 24 12C24 5.3724 18.6276 0 12 0C5.3724 0 0 5.3724 0 12C0 18.6276 5.3724 23.6274 12 24Z"
        fill="white"
      />
      <path
        d="M14.0838 12.7482V16.3224C14.0869 16.388 14.0762 16.4535 14.0525 16.5147C14.0288 16.576 13.9926 16.6316 13.9462 16.678C13.8998 16.7244 13.8442 16.7606 13.7829 16.7843C13.7217 16.808 13.6562 16.8187 13.5906 16.8156H5.0244C4.2558 16.8156 3.7224 16.6686 3.393 16.3662C3.0606 16.0608 2.892 15.6462 2.892 15.1326C2.8908 14.8806 2.9502 14.6328 3.066 14.4096C3.18 14.1912 3.3282 13.9926 3.504 13.8198L6.9372 10.3998H0.1056C0.0354 10.9278 0 11.4606 0 11.9934C0 18.6246 5.3724 24 12 24C13.6088 24.0019 15.2014 23.6792 16.6826 23.0512C18.1637 22.4233 19.503 21.503 20.6202 20.3454L14.0886 12.7542L14.0838 12.7482Z"
        fill="url(#paint0_linear_1003_16)"
      />
      <path
        d="M10.3884 8.235C10.686 8.5398 10.8366 8.988 10.8366 9.5688C10.8414 9.8088 10.8006 10.047 10.7166 10.2708C10.6386 10.4694 10.5204 10.65 10.3698 10.8012L6.98337 14.1888H11.4576V0C6.55017 0.2184 2.40957 3.3852 0.762573 7.773H8.84877C9.58077 7.773 10.0848 7.9242 10.3884 8.235Z"
        fill="url(#paint1_linear_1003_16)"
      />
      <path
        d="M14.1024 10.9854L14.1228 10.9602L18.1254 7.5666C18.1887 7.49329 18.2674 7.43484 18.3558 7.39543C18.4443 7.35602 18.5404 7.33661 18.6372 7.3386H20.7264C20.9754 7.3386 21.1146 7.5018 21.1428 7.6632C21.159 7.7652 21.1464 7.9152 20.994 8.0676L20.9778 8.0826L16.6482 11.8764L22.1844 18.3456C23.3743 16.4408 24.0036 14.2393 24 11.9934C24 6.0738 19.7178 1.155 14.0838 0.167404V11.0106C14.0898 11.0022 14.0958 10.9932 14.1024 10.9854Z"
        fill="url(#paint2_linear_1003_16)"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_1003_16"
        x1={10.3104}
        y1={23.2656}
        x2={10.3104}
        y2={0.376804}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_1003_16"
        x1={6.11037}
        y1={23.2698}
        x2={6.11037}
        y2={0.368999}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_1003_16"
        x1={19.0416}
        y1={23.2716}
        x2={19.0416}
        y2={0.367803}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
