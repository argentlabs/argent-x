import styled from "styled-components"

export const Alert = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin: 40px 20px;
  color: ${({ theme }) => theme.text1}; ;
`
