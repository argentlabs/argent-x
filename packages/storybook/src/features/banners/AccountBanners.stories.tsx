import { H2, P3 } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import type { Meta, StoryObj } from "@storybook/react"
import type { FC, ReactElement } from "react"
import { cloneElement, isValidElement, useState } from "react"

import { ESCAPE_TYPE_GUARDIAN } from "@argent-x/extension/src/shared/account/details/escape.model"
import { accounts } from "@argent-x/extension/src/ui/features/actions/__fixtures__"
import type { AccountBannersProps } from "@argent-x/extension/src/ui/features/banners/AccountBanners"
import { AccountBanners } from "@argent-x/extension/src/ui/features/banners/AccountBanners"
import { AccountDeprecatedBanner } from "@argent-x/extension/src/ui/features/banners/AccountDeprecatedBanner"
import { AccountOwnerBanner } from "@argent-x/extension/src/ui/features/banners/AccountOwnerBanner"
import { EscapeBanner } from "@argent-x/extension/src/ui/features/banners/EscapeBanner"
import { MultisigBanner } from "@argent-x/extension/src/ui/features/banners/MultisigBanner"
import { StatusMessageBanner } from "@argent-x/extension/src/ui/features/banners/StatusMessageBanner"
import { UpgradeBanner } from "@argent-x/extension/src/ui/features/banners/UpgradeBanner"
import { PromoStakingBanner } from "@argent-x/extension/src/ui/features/banners/PromoStakingBanner"
import type { LiveAccountEscapeProps } from "@argent-x/extension/src/ui/features/smartAccount/escape/useAccountEscape"
import { getActiveFromNow } from "@argent-x/extension/src/shared/utils/getActiveFromNow"

import { decorators } from "../../decorators/routerDecorators"
import { statusMessages } from "./__fixtures__/statusMesages"

const meta: Meta<typeof AccountBanners> = {
  component: AccountBanners,
  decorators,
}

export default meta

type Story = StoryObj<typeof AccountBanners>

const activeAtNow = new Date().getTime() / 1000

const activeAt5d = activeAtNow + 24 * 60 * 60 * 5

const account = accounts[0]

const BannersWithRemoval: FC<AccountBannersProps> = ({
  banners: bannersProp,
  ...rest
}) => {
  const [banners, setBanners] = useState(bannersProp)

  const removeBanner = (index: number) => {
    setBanners(banners.filter((_, i) => i !== index))
  }

  const bannersWithRemoval = banners.map((banner, index) => {
    if (isValidElement(banner)) {
      return cloneElement(banner as ReactElement, {
        onClose: () => removeBanner(index),
      })
    }
    return banner
  })

  return (
    <Flex direction="column" p={4} w="full" gap={2}>
      <H2>Account banners</H2>
      <AccountBanners {...rest} banners={bannersWithRemoval} />
      <P3 color="text-secondary">
        This is a carousel of banners that are displayed on the wallet screen
      </P3>
    </Flex>
  )
}

export const Default: Story = {
  render: (props) => <BannersWithRemoval {...props} />,
  args: {
    banners: [
      <AccountDeprecatedBanner
        key="account-deprecated"
        to="/account-deprecated"
      />,
      <AccountOwnerBanner key="account-owner" to="/account-owner" />,
      <UpgradeBanner
        key="upgrade"
        learnMoreLink="https://support.argent.xyz"
      />,
      <EscapeBanner
        key="escape"
        account={account}
        liveAccountEscape={
          {
            activeAt: activeAt5d,
            type: ESCAPE_TYPE_GUARDIAN,
            ...getActiveFromNow(activeAt5d),
          } as LiveAccountEscapeProps
        }
        pending={false}
        accountGuardianIsSelf={null}
      />,
      <MultisigBanner
        key="multisig"
        showActivateMultisigBanner
        onActivateMultisig={() => {}}
        isMultisigDeploying={false}
      />,
      <StatusMessageBanner
        key="status-message"
        statusMessage={statusMessages.info}
        onClose={() => {}}
      />,
      <PromoStakingBanner key="promo-staking" />,
    ],
  },
}

export const Single: Story = {
  ...Default,
  args: {
    banners: [
      <AccountDeprecatedBanner
        key="account-deprecated"
        to="/account-deprecated"
      />,
    ],
  },
}
