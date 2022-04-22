import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../routes"
import { BackIcon } from "../Icons/Back"
import { CloseIcon } from "../Icons/Close"

export const IconBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
`

const IconBarReverse = styled(IconBar)`
  flex-direction: row-reverse;
`

export const IconBarWithIcons: FC<{
  showBack?: boolean
}> = ({ showBack = false }) => {
  const navigate = useNavigate()
  return (
    <IconBarReverse>
      <CloseIcon onClick={() => navigate(routes.account())} />
      {showBack && <BackIcon onClick={() => navigate(-1)} />}
    </IconBarReverse>
  )
}
