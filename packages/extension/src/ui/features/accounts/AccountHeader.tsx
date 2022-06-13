import styled from "styled-components"

export const AccountHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(0deg, rgba(16, 16, 16, 0.4) 0%, #161616 73.72%);
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  height: 68px;
  z-index: 100;
  ${(props) => props.theme.breakpoints.up("sm")} {
    left: 10%;
    right: 10%;
  }
`
