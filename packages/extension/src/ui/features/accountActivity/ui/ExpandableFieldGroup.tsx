import { Collapse } from "@mui/material"
import { Children, FC, ReactNode, useCallback, useState } from "react"
import styled from "styled-components"

import { DisclosureIcon } from "../../../components/DisclosureIcon"
import {
  Field,
  FieldGroup,
  FieldKeyGroup,
  FieldValue,
} from "../../../components/Fields"

const IconAndTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const IconContainer = styled.div`
  margin-right: 12px;
`

const Title = styled.div`
  color: ${({ theme }) => theme.text2};
`

const SubTitle = styled.div``

const StyledCollapse = styled(Collapse)`
  ${Field}:first-child, ${Field} + ${Field} {
    border-top: 1px solid ${({ theme }) => theme.bg1};
  }
`

const StyledFieldGroup = styled(FieldGroup)`
  ${FieldGroup} {
    margin-bottom: 0;
    border-radius: 0;
  }
`

export interface IExpandableFieldGroup {
  icon?: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  children?: ReactNode | ReactNode[]
}

export const ExpandableFieldGroup: FC<IExpandableFieldGroup> = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  const [expanded, setExpanded] = useState(false)
  const toggleExpanded = useCallback(() => {
    setExpanded((expanded) => !expanded)
  }, [])
  const hasChildren = Children.toArray(children).length > 0
  return (
    <StyledFieldGroup>
      <Field clickable={hasChildren} onClick={toggleExpanded}>
        <IconAndTitleContainer>
          {icon && <IconContainer>{icon}</IconContainer>}
          <FieldKeyGroup>
            <Title>{title}</Title>
            <SubTitle>{subtitle}</SubTitle>
          </FieldKeyGroup>
        </IconAndTitleContainer>
        {hasChildren && (
          <FieldValue>
            <DisclosureIcon expanded={expanded} />
          </FieldValue>
        )}
      </Field>
      {hasChildren && (
        <StyledCollapse in={expanded} timeout="auto">
          {children}
        </StyledCollapse>
      )}
    </StyledFieldGroup>
  )
}
