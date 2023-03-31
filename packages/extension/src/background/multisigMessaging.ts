import { tryToMintFeeToken } from "../shared/devnet/mintFeeToken"
import { MultisigMessage } from "../shared/messages/MultisigMessage"
import { getMultisigAccounts } from "../shared/multisig/utils/baseMultisig"
import { deployMultisigAction } from "./accountDeploy"
import { sendMessageToUi } from "./activeTabs"
import { analytics } from "./analytics"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleMultisigMessage: HandleMessage<MultisigMessage> = async ({
  msg,
  background: { wallet, actionQueue },
}) => {
  switch (msg.type) {
    case "NEW_MULTISIG_ACCOUNT": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const { networkId, signers, threshold, creator } = msg.data
      try {
        const account = await wallet.newAccount(networkId, "multisig", {
          signers,
          threshold,
          creator,
        })
        tryToMintFeeToken(account)

        analytics.track("createAccount", {
          status: "success",
          networkId,
          type: "multisig",
        })

        const accounts = await getMultisigAccounts()

        return sendMessageToUi({
          type: "NEW_MULTISIG_ACCOUNT_RES",
          data: {
            account,
            accounts,
          },
        })
      } catch (exception) {
        const error = `${exception}`

        analytics.track("createAccount", {
          status: "failure",
          networkId: networkId,
          type: "multisig",
          errorMessage: error,
        })

        return sendMessageToUi({
          type: "NEW_MULTISIG_ACCOUNT_REJ",
          data: { error },
        })
      }
    }

    case "DEPLOY_MULTISIG": {
      try {
        await deployMultisigAction({
          account: msg.data,
          actionQueue,
        })

        return sendMessageToUi({ type: "DEPLOY_MULTISIG_RES" })
      } catch (e) {
        return sendMessageToUi({ type: "DEPLOY_MULTISIG_REJ" })
      }
    }

    case "NEW_PENDING_MULTISIG": {
      if (!(await wallet.isSessionOpen())) {
        throw Error("you need an open session")
      }

      const { networkId } = msg.data
      try {
        const pendingMultisig = await wallet.newPendingMultisig(networkId)

        // TODO: Add tracking
        // analytics.track("createAccount", {
        //   status: "success",
        //   networkId,
        //   type: "multisig",
        // })

        return sendMessageToUi({
          type: "NEW_PENDING_MULTISIG_RES",
          data: pendingMultisig,
        })
      } catch (exception) {
        const error = `${exception}`

        // TODO: Add tracking

        // analytics.track("createAccount", {
        //   status: "failure",
        //   networkId: networkId,
        //   type: "multisig",
        //   errorMessage: error,
        // })

        return sendMessageToUi({
          type: "NEW_PENDING_MULTISIG_REJ",
          data: { error },
        })
      }
    }
  }

  throw new UnhandledMessage()
}
