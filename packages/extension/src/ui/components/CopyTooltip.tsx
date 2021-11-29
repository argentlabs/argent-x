import Tippy from "@tippyjs/react"
import { FC, useState } from "react"
import CopyToClipboard from "react-copy-to-clipboard"
import styled from "styled-components"

export const Tooltip = styled.span`
  background: #ffffff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  color: black;
  padding: 5px 10px;
`

interface CopyTooltipProps {
  copyValue: string
  message: string
}

export const CopyTooltip: FC<CopyTooltipProps> = ({
  copyValue,
  message,
  children,
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <Tippy
      visible={visible}
      content={<Tooltip>{message}</Tooltip>}
      onClickOutside={() => setVisible(false)}
    >
      <div>
        <CopyToClipboard text={copyValue} onCopy={() => setVisible(true)}>
          {children}
        </CopyToClipboard>
      </div>
    </Tippy>
  )
}
