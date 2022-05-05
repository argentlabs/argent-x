import { isString } from "lodash-es"
import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../routes"
import { BackLink } from "./BackLink"
import { BackIcon } from "./Icons/Back"
import { CloseIcon } from "./Icons/Close"

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
`

const IconBarReverse = styled(Bar)`
  flex-direction: row-reverse;
`

interface IconBarProps {
  back?: boolean
  close?: boolean | string
}

export const IconBar: FC<IconBarProps> = ({ back, close }) => (
  <IconBarReverse>
    {close && (
      <Link to={isString(close) ? close : routes.accountTokens()}>
        <CloseIcon />
      </Link>
    )}
    {back && (
      <BackLink>
        <BackIcon />
      </BackLink>
    )}
  </IconBarReverse>
)
