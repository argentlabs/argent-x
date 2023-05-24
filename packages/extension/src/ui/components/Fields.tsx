import styled, { css } from "styled-components"

export const Field = styled.div<{ clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;

  ${({ theme, clickable }) =>
    clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${theme.button.transparent.bg.hover};
      }
      transition: background-color 200ms ease-in-out;
    `}
`

export const FieldGroup = styled.section<{ error?: boolean }>`
  background: ${({ theme }) => theme.bg2};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  overflow: hidden;
  > ${Field} + ${Field} {
    border-top: 1px solid ${({ theme }) => theme.bg1};
  }

  ${({ theme, error = false }) =>
    error &&
    css`
      border-color: ${theme.red1};
    `}
`

export const FieldValue = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.text1};

  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
`

export const FieldKeyGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`

export const FieldKey = styled(FieldValue)<{ withoutColor?: boolean }>`
  ${({ withoutColor = false }) =>
    !withoutColor &&
    css`
      color: ${({ theme }) => theme.text2};
    `}
`

export const LeftPaddedField = styled.div`
  margin-left: 8px;
  text-align: right;
`

export const SectionHeader = styled.div`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  background-color: ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.text1};
`
