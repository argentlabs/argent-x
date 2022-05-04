import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { BackIcon } from "../../components/Icons/Back"
import { CloseIcon } from "../../components/Icons/Close"
import { routes } from "../../routes"

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
      <CloseIcon onClick={() => navigate(routes.accountTokens())} />
      {showBack && <BackIcon onClick={() => navigate(-1)} />}
    </IconBarReverse>
  )
}
