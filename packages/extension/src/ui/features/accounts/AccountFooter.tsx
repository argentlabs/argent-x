import { Link } from "react-router-dom"
import styled from "styled-components"

export const AccountFooter = styled.div`
  position: fixed;
  display: flex;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: linear-gradient(
    180deg,
    rgba(16, 16, 16, 0.4) 0%,
    ${({ theme }) => theme.bg1} 73.72%
  );
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  ${({ theme }) => theme.mediaMinWidth.sm`
    left: ${theme.margin.extensionInTab};
    right: ${theme.margin.extensionInTab};
  `}
`

export const FooterTab = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 33.33%;

  svg {
    font-size: 1.8rem;
  }

  span {
    margin-top: 3px;
  }

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.05);
  }
`

export const FooterTabBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 4px;
  width: 16px;
  height: 16px;
  margin-left: 12px;
  padding: 6px;
  border-radius: 500px;
  font-size: 11px;
  line-height: 1;
  font-weight: 600;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.blue1};
`
