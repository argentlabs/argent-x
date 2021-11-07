import styled from 'styled-components';

export const Button = styled.button`
  margin: 0;
  padding: 13.5px;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  text-align: center;

  background: rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  width: 100%;
  outline: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 200ms ease-in-out;

  &:hover,
  &:focus {
    outline: 0;
    background: rgba(255, 255, 255, 0.25);
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    cursor: auto;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const ButtonGroupVertical = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  width: 100%;
`;
