import { Link } from "react-router-dom"
import styled from "styled-components"

export const AccountFooter = styled.div`
  position: fixed;
  display: flex;
  bottom: 0;
  width: 100%;
  height: 64px;
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.4) 0%, #161616 73.72%);
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
`

export const FooterTab = styled(Link)`
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
