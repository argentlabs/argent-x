import styled from "styled-components"

export const IconButton = styled.span<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.15);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.25);
    outline: 0;
  }

  & > * {
    max-width: 100%;
  }
`
