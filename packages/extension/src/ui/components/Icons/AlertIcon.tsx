import { FC, SVGProps } from "react"

export const AlertIcon: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20.5332 34.6666C20.5332 36.5866 22.0799 38.1333 23.9999 38.1333C25.9199 38.1333 27.4665 36.5866 27.4665 34.6666C27.4665 32.7466 25.9199 31.2 23.9999 31.2C22.0799 31.2 20.5332 32.7466 20.5332 34.6666Z"
        fill="#C12026"
      />
      <path
        d="M21.3332 26.6666H26.6665V10.6666H21.3332V26.6666Z"
        fill="#C12026"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.0533 0H33.9467L48 14.0533V33.9467L33.9467 48H14.0533L0 33.9467V14.0533L14.0533 0ZM5 16.1244L16.1244 5H31.8756L43 16.1244V31.8756L31.8756 43H16.1244L5 31.8756V16.1244Z"
        fill="#C12026"
      />
    </svg>
  )
}
