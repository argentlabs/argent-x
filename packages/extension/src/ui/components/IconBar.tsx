import { isString } from "lodash-es"
import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../routes"
import { BackLink } from "./BackLink"
import { BackIcon } from "./Icons/BackIcon"
import { CloseIcon } from "./Icons/CloseIcon"

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 18px;

  hr {
    margin: 0 auto;
    visibility: hidden;
  }
`

interface IconBarProps {
  back?: boolean | string
  /** close={-1} will navigate 'back' to previous route */
  close?: boolean | string | -1
}

export const IconBar: FC<IconBarProps> = ({ back, close }) => (
  <Bar>
    {back && (
      <BackLink>
        <BackIcon />
      </BackLink>
    )}
    <hr />
    {close && (
      <Link to={close !== undefined ? (close as any) : routes.accountTokens()}>
        <CloseIcon />
      </Link>
    )}
  </Bar>
)
