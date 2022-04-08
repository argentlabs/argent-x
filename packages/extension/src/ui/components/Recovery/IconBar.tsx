import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../routes"
import { BackIcon } from "../Icons/Back"
import { CloseIcon } from "../Icons/Close"

const IconBar = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
`

export const IconBarWithIcons: FC<{
  showBack?: boolean
}> = ({ showBack = false }) => {
  const navigate = useNavigate()
  return (
    <IconBar>
      <CloseIcon onClick={() => navigate(routes.account())} />
      {showBack && <BackIcon onClick={() => navigate(-1)} />}
    </IconBar>
  )
}
