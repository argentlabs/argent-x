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
    <mask
      id="prefix__a"
      width={24}
      height={24}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <path fill="currentColor" d="M0 0h24v24H0V0Z" />
    </mask>
    <g mask="url(#prefix__a)">
      <path
        fill="currentColor"
        d="M12 24c6.628 0 12-5.372 12-12S18.628 0 12 0 0 5.372 0 12s5.372 11.627 12 12Z"
      />
      <path
        fill="url(#prefix__b)"
        d="M14.084 12.748v3.574a.471.471 0 0 1-.493.494H5.024c-.768 0-1.302-.147-1.631-.45-.332-.305-.501-.72-.501-1.233-.001-.252.058-.5.174-.723.114-.219.262-.417.438-.59l3.433-3.42H.106C.036 10.928 0 11.46 0 11.993 0 18.625 5.372 24 12 24a11.96 11.96 0 0 0 8.62-3.655l-6.531-7.59-.005-.007Z"
      />
      <path
        fill="url(#prefix__c)"
        d="M10.388 8.235c.298.305.449.753.449 1.334a1.89 1.89 0 0 1-.12.702 1.56 1.56 0 0 1-.347.53L6.983 14.19h4.475V0C6.55.218 2.41 3.385.763 7.773h8.086c.732 0 1.236.151 1.54.462Z"
      />
      <path
        fill="url(#prefix__d)"
        d="m14.102 10.985.02-.025 4.003-3.393a.659.659 0 0 1 .512-.228h2.09c.248 0 .388.163.416.324.016.102.003.252-.149.405l-.016.015-4.33 3.793 5.536 6.47A11.954 11.954 0 0 0 24 11.993c0-5.92-4.282-10.838-9.916-11.826v10.844l.018-.026Z"
      />
    </g>
    <defs>
      <linearGradient
        id="prefix__b"
        x1={10.31}
        x2={10.31}
        y1={23.266}
        y2={0.377}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
      <linearGradient
        id="prefix__c"
        x1={6.11}
        x2={6.11}
        y1={23.27}
        y2={0.369}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
      <linearGradient
        id="prefix__d"
        x1={19.042}
        x2={19.042}
        y1={23.272}
        y2={0.368}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5284D6" />
        <stop offset={1} stopColor="#1B2393" />
      </linearGradient>
    </defs>
  </svg>
)
export default chakra(SvgComponent)
