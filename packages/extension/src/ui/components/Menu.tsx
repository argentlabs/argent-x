import styled from "styled-components"

export const MenuContainer = styled.div`
  position: relative;
`

export const Menu = styled.div`
  position: absolute;
  top: 95%;
  right: 45%;
  background-color: ${({ theme }) => theme.bg3};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 134px;
  z-index: 100;
`

export const Separator = styled.div`
  border-top: 1px solid #525252;
  width: 100%;
`

export const MenuItemWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
`

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0px 6px 10px;
  gap: 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
`

export const IconWrapper = styled.div`
  height: 13px;
  width: 12px;
  font-size: 12px;
`
