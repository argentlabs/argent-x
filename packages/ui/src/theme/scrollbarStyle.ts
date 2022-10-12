import { css } from "styled-components"

export const scrollbarStyle = css`
  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.05);
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`
