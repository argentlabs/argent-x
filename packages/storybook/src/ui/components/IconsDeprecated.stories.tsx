import { AlertIcon } from "@argent-x/extension/src/ui/components/Icons/AlertIcon"
import { AspectLogo } from "@argent-x/extension/src/ui/components/Icons/AspectLogo"
import { AtTheRateIcon } from "@argent-x/extension/src/ui/components/Icons/AtTheRateIcon"
import { BackIcon } from "@argent-x/extension/src/ui/components/Icons/BackIcon"
import { ChevronDown } from "@argent-x/extension/src/ui/components/Icons/ChevronDown"
import { ChevronRight } from "@argent-x/extension/src/ui/components/Icons/ChevronRight"
import { CloseIcon } from "@argent-x/extension/src/ui/components/Icons/CloseIcon"
import { CloseIconAlt } from "@argent-x/extension/src/ui/components/Icons/CloseIconAlt"
import { DangerIcon } from "@argent-x/extension/src/ui/components/Icons/DangerIcon"
import { DiscordIcon } from "@argent-x/extension/src/ui/components/Icons/DiscordIcon"
import { EditIcon } from "@argent-x/extension/src/ui/components/Icons/EditIcon"
import { GithubIcon } from "@argent-x/extension/src/ui/components/Icons/GithubIcon"
import { MintSquareLogo } from "@argent-x/extension/src/ui/components/Icons/MintSquareLogo"
import { NetworkWarningIcon } from "@argent-x/extension/src/ui/components/Icons/NetworkWarningIcon"
import { PlusCircle } from "@argent-x/extension/src/ui/components/Icons/PlusCircle"
import { SearchIcon } from "@argent-x/extension/src/ui/components/Icons/SearchIcon"
import { SupportIcon } from "@argent-x/extension/src/ui/components/Icons/SupportIcon"
import { UpdateIcon } from "@argent-x/extension/src/ui/components/Icons/UpdateIcon"
import { ViewOnBlockExplorerIcon } from "@argent-x/extension/src/ui/components/Icons/ViewOnBlockExplorerIcon"
import { WarningIcon } from "@argent-x/extension/src/ui/components/Icons/WarningIcon"
import { WarningIconRounded } from "@argent-x/extension/src/ui/components/Icons/WarningIconRounded"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { FC } from "react"
import styled from "styled-components"

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  font-size: 48px;
  color: #ff00ff;
  > * {
    background-color: #333333;
  }
`

const Icons: FC = () => (
  <Container>
    <AlertIcon />
    <AspectLogo />
    <AtTheRateIcon />
    <BackIcon />
    <ChevronDown />
    <ChevronRight />
    <CloseIcon />
    <CloseIconAlt />
    <DangerIcon />
    <DiscordIcon />
    <EditIcon />
    <GithubIcon />
    <MintSquareLogo />
    <NetworkWarningIcon />
    <PlusCircle />
    <SearchIcon />
    <SupportIcon />
    <UpdateIcon />
    <ViewOnBlockExplorerIcon />
    <WarningIcon />
    <WarningIconRounded />
  </Container>
)

export default {
  title: "components/IconsDeprecated",
  component: Icons,
} as ComponentMeta<typeof Icons>

const Template: ComponentStory<typeof Icons> = (props) => (
  <Icons {...props}></Icons>
)

export const Default = Template.bind({})
Default.args = {}
