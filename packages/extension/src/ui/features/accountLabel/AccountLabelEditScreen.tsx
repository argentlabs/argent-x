import { BarBackButton, FieldError, NavigationContainer } from "@argent/x-ui"
import { useCallback, useMemo, useState, type FC } from "react"
import { useNavigate } from "react-router-dom"
import { useRouteAccountId } from "../../hooks/useRoute"
import { useWalletAccount } from "../accounts/accounts.state"
import { Button, Flex } from "@chakra-ui/react"
import { voidify } from "@argent/x-shared"
import {
  accountService,
  accountSharedService,
} from "../../../shared/account/service"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountNameInput } from "./AccountNameInput"
import { AccountAvatarSelector } from "./AccountAvatarSelector"
import { deserializeAccountIdentifier } from "../../../shared/utils/accountIdentifier"
import { getAccountLabelVersion } from "../../../shared/accountNameGenerator/utils"
import {
  accountLabelDataSchema,
  type AccountLabelData,
  type LabelVersion,
} from "./types"
import { AvatarBackgroundPicker } from "./AvatarBackgroundPicker"
import { AvatarEmojiPicker } from "./AvatarEmojiPicker"
import { smartAccountService } from "../../../shared/smartAccount"
import { getAccountMeta } from "../../../shared/accountNameGenerator"
import { ampli } from "../../../shared/analytics"

export const AccountLabelEditScreen: FC = () => {
  const navigate = useNavigate()

  const accountId = useRouteAccountId()
  const account = useWalletAccount(accountId)

  const defaultLabelVersion = useMemo(() => {
    if (!account) {
      return "v2"
    }
    return getAccountLabelVersion(account.name, account.avatarMeta)
  }, [account])

  const [labelVersion, setLabelVersion] =
    useState<LabelVersion>(defaultLabelVersion)

  const {
    color: gColor,
    name: gName,
    emoji: gEmoji,
  } = useMemo(() => {
    if (!account) {
      return { name: "", color: "", emoji: "" } // should not happen
    }

    const data = getAccountMeta(account.id, account.type)

    return {
      ...data,
      color: data.color.token, // using color tokens for ease
    }
  }, [account])

  const defaultValues = useMemo(() => {
    if (!account) {
      return { accountName: "", bgColor: "", emoji: "" }
    }

    const bgColor = account.avatarMeta?.bgColor ?? gColor

    if (defaultLabelVersion === "v1") {
      return { accountName: account.name, emoji: null, bgColor }
    }

    return {
      accountName: account.name,
      emoji: account?.avatarMeta?.emoji ?? gEmoji,
      bgColor,
    }
  }, [account, defaultLabelVersion, gColor, gEmoji])

  const methods = useForm<AccountLabelData>({
    resolver: zodResolver(accountLabelDataSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods

  const bgColor = watch("bgColor")
  const liveAccountName = watch("accountName")
  const emoji = watch("emoji")

  const onSubmit = async ({
    accountName,
    bgColor,
    emoji,
  }: AccountLabelData) => {
    if (!account) {
      return
    }

    // Update account name only if it has changed
    if (accountName !== account.name) {
      await accountService.setName(accountName, account.id)
      ampli.accountNameRenamed()
    }
    await accountService.setAvatarMeta({ bgColor, emoji }, account.id)

    const isSignedIn = smartAccountService.isSignedIn
    if (account.type === "smart" && isSignedIn) {
      await accountSharedService.sendAccountLabelToBackend({
        address: account.address,
        name: accountName,
        networkId: account.networkId,
        avatarMeta: { bgColor, emoji },
      })
    }

    // Track account icon change if it's different from the default
    if (labelVersion !== defaultLabelVersion) {
      ampli.accountIconChanged({
        "account icon": emoji ? "emoji" : "initials",
      })
    }

    void navigate(-1)
  }

  const v1AccountName = useMemo(() => {
    if (!account) {
      return ""
    }

    const signerIndex = deserializeAccountIdentifier(account.id).signer.index

    switch (account.type) {
      case "multisig":
        return `Multisig ${signerIndex + 1}`
      case "imported":
        return `Imported account ${signerIndex + 1}`
      default:
        return `Account ${signerIndex + 1}`
    }
  }, [account])

  const onLabelVersionChange = useCallback(
    (v: LabelVersion) => {
      setLabelVersion(v)
      if (v === "v2") {
        setValue("accountName", gName)
        setValue("emoji", gEmoji)
      }

      if (v === "v1") {
        setValue("accountName", v1AccountName)
        setValue("emoji", null)
      }
    },
    [setValue, gName, gEmoji, v1AccountName],
  )

  if (!account) {
    return null
  }

  return (
    <FormProvider {...methods}>
      <NavigationContainer
        title="Account settings"
        leftButton={<BarBackButton onClick={() => void navigate(-1)} />}
      >
        <Flex
          direction="column"
          flex={1}
          as="form"
          onSubmit={voidify(handleSubmit(onSubmit))}
          autoComplete="off"
          p={4}
        >
          <Flex flex={1} direction="column">
            <AccountAvatarSelector
              account={account}
              labelVersion={labelVersion}
              onLabelVersionChange={onLabelVersionChange}
              accountName={
                labelVersion === "v2" ? v1AccountName : liveAccountName
              }
              emoji={emoji}
              bgColor={bgColor}
            />
            <AccountNameInput account={account} />
            {errors.accountName && (
              <FieldError alignSelf="center">
                {errors.accountName?.message}
              </FieldError>
            )}
            <AvatarBackgroundPicker
              bgColor={bgColor}
              onBgColorChange={(c) => setValue("bgColor", c)}
            />
            {labelVersion === "v2" && (
              <AvatarEmojiPicker
                emoji={emoji}
                onEmojiChange={(emoji) => setValue("emoji", emoji)}
                bgColor={bgColor}
              />
            )}
          </Flex>
          <Button
            type="submit"
            variant="solid"
            w="full"
            colorScheme="primary"
            mb={4}
            isDisabled={!liveAccountName}
          >
            Save
          </Button>
        </Flex>
      </NavigationContainer>
    </FormProvider>
  )
}
