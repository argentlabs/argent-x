import styled, { css } from "styled-components"

export const Field = styled.div<{ clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;

  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `}
`

export const FieldError = styled.div<{ justify?: string }>`
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.red1};
  display: flex;
  justify-content: ${({ justify }) => (justify ? justify : "center")};
  align-items: center;

  padding: 8px 10px;
  font-size: 12px;
  line-height: 15px;
`

export const FieldGroup = styled.section<{ error?: boolean }>`
  background: ${({ theme }) => theme.bg2};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg2};
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
  color: #ffffff;

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

export const FieldValueGroup = styled(FieldKeyGroup)`
  align-items: flex-end;
`

export const FieldKey = styled(FieldValue)<{ withoutColor?: boolean }>`
  ${({ withoutColor = false }) =>
    !withoutColor &&
    css`
      color: ${({ theme }) => theme.text2};
    `}
`

export const FieldKeyMeta = styled(FieldKey)`
  font-size: 12px;
  line-height: 14px;
  margin-top: 2px;
`

export const FieldValueMeta = styled(FieldKeyMeta)``

export const LeftPaddedField = styled.div`
  margin-left: 8px;
  text-align: right;
`
