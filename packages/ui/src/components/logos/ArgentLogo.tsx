import { SVGProps } from "react"

const ArgentLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    className="argentLogoColor"
    {...props}
  >
    <style>{`
      .argentLogoColor {
        color: #FF875B;
      }
    `}</style>
    <path
      d="M12.5733 0.833252H7.42662C7.25463 0.833252 7.11684 0.976081 7.11309 1.15362C7.0091 6.14396 4.48038 10.8804 0.127923 14.2353C-0.0102608 14.3417 -0.0417421 14.5418 0.0592828 14.6859L3.07055 18.9848C3.17299 19.1312 3.37259 19.1642 3.5131 19.0567C6.23458 16.9727 8.42358 14.4587 9.99998 11.6722C11.5764 14.4587 13.7655 16.9727 16.487 19.0567C16.6274 19.1642 16.827 19.1312 16.9295 18.9848L19.9408 14.6859C20.0417 14.5418 20.0102 14.3417 19.8722 14.2353C15.5196 10.8804 12.9909 6.14396 12.887 1.15362C12.8833 0.976081 12.7453 0.833252 12.5733 0.833252Z"
      fill="currentColor"
    />
  </svg>
)

export default ArgentLogo
