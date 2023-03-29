import { utils } from "ethers"
import {
  Account,
  InvocationsSignerDetails,
  TransactionBulk,
  hash,
  number,
  stark,
} from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import { isAccountDeployed } from "../accountDeploy"
import { sendMessageToUi } from "../activeTabs"
import { HandleMessage, UnhandledMessage } from "../background"
import { argentMaxFee } from "../utils/argentMaxFee"
import { addEstimatedFees } from "./fees/store"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({ msg, background: { wallet, actionQueue }, respond: respond }) => {
  switch (msg.type) {
    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionQueue.push({
        type: "TRANSACTION",
        payload: msg.data,
      })
      return respond({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "ESTIMATE_TRANSACTION_FEE": {
      const selectedAccount = await wallet.getSelectedAccount()
      const starknetAccount = await wallet.getSelectedStarknetAccount()
      const transactions = msg.data

      if (!selectedAccount) {
        throw Error("no accounts")
      }
      try {
        let txFee = "0",
          maxTxFee = "0",
          accountDeploymentFee: string | undefined,
          maxADFee: string | undefined

        if (
          selectedAccount.needsDeploy &&
          !(await isAccountDeployed(
            selectedAccount,
            starknetAccount.getClassAt,
          ))
        ) {
          if ("estimateFeeBulk" in starknetAccount) {
            const bulkTransactions: TransactionBulk = [
              {
                type: "DEPLOY_ACCOUNT",
                payload: await wallet.getAccountDeploymentPayload(
                  selectedAccount,
                ),
              },
              {
                type: "INVOKE_FUNCTION",
                payload: transactions,
              },
            ]

            const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
              bulkTransactions,
            )

            accountDeploymentFee = number.toHex(estimateFeeBulk[0].overall_fee)
            txFee = number.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = argentMaxFee(estimateFeeBulk[1].suggestedMaxFee)
          }
        } else {
          const { overall_fee, suggestedMaxFee } =
            await starknetAccount.estimateFee(transactions)

          txFee = number.toHex(overall_fee)
          maxTxFee = number.toHex(suggestedMaxFee) // Here, maxFee = estimatedFee * 1.5x
        }

        const suggestedMaxFee = number.toHex(
          stark.estimatedFeeToMaxFee(maxTxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )
        addEstimatedFees({
          amount: txFee,
          suggestedMaxFee,
          accountDeploymentFee,
          maxADFee,
          transactions,
        })
        return respond({
          type: "ESTIMATE_TRANSACTION_FEE_RES",
          data: {
            amount: txFee,
            suggestedMaxFee,
            accountDeploymentFee,
            maxADFee,
          },
        })
      } catch (error) {
        console.error(error)
        return respond({
          type: "ESTIMATE_TRANSACTION_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE": {
      const providedAccount = msg.data
      const account = providedAccount
        ? await wallet.getAccount(providedAccount)
        : await wallet.getSelectedAccount()

      if (!account) {
        throw Error("no accounts")
      }

      try {
        const { overall_fee, suggestedMaxFee } =
          await wallet.getAccountDeploymentFee(account)

        const maxADFee = number.toHex(
          stark.estimatedFeeToMaxFee(suggestedMaxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return respond({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES",
          data: {
            amount: number.toHex(overall_fee),
            maxADFee,
          },
        })
      } catch (error) {
        // FIXME: This is a temporary fix for the case where the user has a multisig account.
        // Once starknet 0.11 is released, we can remove this.
        if (account.type === "multisig") {
          const fallbackPrice = number.toBN(10e14)
          return respond({
            type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES",
            data: {
              amount: number.toHex(fallbackPrice),
              maxADFee: argentMaxFee(fallbackPrice),
            },
          })
        }

        console.error(error)
        return respond({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "ESTIMATE_DECLARE_CONTRACT_FEE": {
      const { classHash, contract, ...restData } = msg.data

      const selectedAccount = await wallet.getSelectedAccount()
      const selectedStarknetAccount =
        "address" in restData
          ? await wallet.getStarknetAccount(restData)
          : await wallet.getSelectedStarknetAccount()

      if (!selectedStarknetAccount) {
        throw Error("no accounts")
      }

      let txFee = "0",
        maxTxFee = "0",
        accountDeploymentFee: string | undefined,
        maxADFee: string | undefined

      try {
        if (
          selectedAccount?.needsDeploy &&
          !(await isAccountDeployed(
            selectedAccount,
            selectedStarknetAccount.getClassAt,
          ))
        ) {
          if ("estimateFeeBulk" in selectedStarknetAccount) {
            const deployPayload =
              selectedAccount.type === "multisig"
                ? await wallet.getMultisigDeploymentPayload(selectedAccount)
                : await wallet.getAccountDeploymentPayload(selectedAccount)
            const bulkTransactions: TransactionBulk = [
              {
                type: "DEPLOY_ACCOUNT",
                payload: deployPayload,
              },
              {
                type: "DECLARE",
                payload: {
                  classHash,
                  contract,
                },
              },
            ]

            const estimateFeeBulk =
              await selectedStarknetAccount.estimateFeeBulk(bulkTransactions)

            accountDeploymentFee = number.toHex(estimateFeeBulk[0].overall_fee)
            txFee = number.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = estimateFeeBulk[1].suggestedMaxFee
          }
        } else {
          if ("estimateDeclareFee" in selectedStarknetAccount) {
            const { overall_fee, suggestedMaxFee } =
              await selectedStarknetAccount.estimateDeclareFee({
                classHash,
                contract,
              })
            txFee = number.toHex(overall_fee)
            maxTxFee = number.toHex(suggestedMaxFee)
          } else {
            throw Error("estimateDeclareFee not supported")
          }
        }

        const suggestedMaxFee = argentMaxFee(maxTxFee) // This add the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x

        return respond({
          type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES",
          data: {
            amount: txFee,
            suggestedMaxFee,
            accountDeploymentFee,
            maxADFee,
          },
        })
      } catch (error) {
        console.error(error)
        return respond({
          type: "ESTIMATE_DECLARE_CONTRACT_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString?.() ??
              (error as any)?.toString?.() ??
              "Unkown error",
          },
        })
      }
    }

    case "ESTIMATE_DEPLOY_CONTRACT_FEE": {
      const { classHash, constructorCalldata, salt, unique } = msg.data

      const selectedAccount = await wallet.getSelectedAccount()
      const selectedStarknetAccount = await wallet.getSelectedStarknetAccount()

      if (!selectedStarknetAccount || !selectedAccount) {
        throw Error("no accounts")
      }

      let txFee = "0",
        maxTxFee = "0",
        accountDeploymentFee: string | undefined,
        maxADFee: string | undefined

      try {
        if (
          selectedAccount?.needsDeploy &&
          !(await isAccountDeployed(
            selectedAccount,
            selectedStarknetAccount.getClassAt,
          ))
        ) {
          if ("estimateFeeBulk" in selectedStarknetAccount) {
            const bulkTransactions: TransactionBulk = [
              {
                type: "DEPLOY_ACCOUNT",
                payload: await wallet.getAccountDeploymentPayload(
                  selectedAccount,
                ),
              },
              {
                type: "DEPLOY",
                payload: {
                  classHash,
                  salt,
                  unique,
                  constructorCalldata,
                },
              },
            ]

            const estimateFeeBulk =
              await selectedStarknetAccount.estimateFeeBulk(bulkTransactions)

            accountDeploymentFee = number.toHex(estimateFeeBulk[0].overall_fee)
            txFee = number.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = estimateFeeBulk[1].suggestedMaxFee
          }
        } else {
          if ("estimateDeployFee" in selectedStarknetAccount) {
            const { overall_fee, suggestedMaxFee } =
              await selectedStarknetAccount.estimateDeployFee({
                classHash,
                salt,
                unique,
                constructorCalldata,
              })
            txFee = number.toHex(overall_fee)
            maxTxFee = number.toHex(suggestedMaxFee)
          } else {
            throw Error("estimateDeployFee not supported")
          }
        }

        const suggestedMaxFee = argentMaxFee(maxTxFee) // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x

        return respond({
          type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES",
          data: {
            amount: txFee,
            suggestedMaxFee,
            accountDeploymentFee,
            maxADFee,
          },
        })
      } catch (error) {
        console.log(error)
        return respond({
          type: "ESTIMATE_DEPLOY_CONTRACT_FEE_REJ",
          data: {
            error:
              (error as any)?.message?.toString() ??
              (error as any)?.toString() ??
              "Unkown error",
          },
        })
      }
    }

    case "SIMULATE_TRANSACTION_INVOCATION": {
      const transactions = Array.isArray(msg.data) ? msg.data : [msg.data]

      try {
        const selectedAccount = await wallet.getSelectedAccount()
        const starknetAccount =
          (await wallet.getSelectedStarknetAccount()) as Account // Old accounts are not supported

        if (!selectedAccount) {
          throw Error("no accounts")
        }

        const nonce = await starknetAccount.getNonce()

        const chainId = starknetAccount.chainId

        const version = number.toHex(hash.feeTransactionVersion)

        const signerDetails: InvocationsSignerDetails = {
          walletAddress: starknetAccount.address,
          nonce,
          maxFee: 0,
          version,
          chainId,
        }

        // TODO: Use this when Simulate Transaction allows multiple transaction types
        // const signerDetailsWithZeroNonce = {
        //   ...signerDetails,
        //   nonce: 0,
        // }

        // const accountDeployPayload = await wallet.getAccountDeploymentPayload(
        //   selectedAccount,
        // )

        // const accountDeployInvocation =
        //   await starknetAccount.buildAccountDeployPayload(
        //     accountDeployPayload,
        //     signerDetailsWithZeroNonce,
        //   )

        const { contractAddress, calldata, signature } =
          await starknetAccount.buildInvocation(transactions, signerDetails)

        const invocation = {
          type: "INVOKE_FUNCTION" as const,
          contract_address: contractAddress,
          calldata,
          signature,
          nonce,
          version,
        }

        return respond({
          type: "SIMULATE_TRANSACTION_INVOCATION_RES",
          data: {
            invocation,
            chainId,
          },
        })
      } catch (error) {
        console.log(error)
        return respond({
          type: "SIMULATE_TRANSACTION_INVOCATION_REJ",
          data: {
            error:
              (error as any)?.message?.toString() ??
              (error as any)?.toString() ??
              "Unkown error",
          },
        })
      }
    }

    case "TRANSACTION_FAILED": {
      return await actionQueue.remove(msg.data.actionHash)
    }

    case "SIMULATE_TRANSACTION_FALLBACK": {
      const selectedAccount = await wallet.getSelectedAccount()
      const starknetAccount =
        (await wallet.getSelectedStarknetAccount()) as Account // Old accounts are not supported

      if (!selectedAccount) {
        throw Error("no accounts")
      }

      const nonce = await starknetAccount.getNonce()

      try {
        const simulated = await starknetAccount.simulateTransaction(msg.data, {
          nonce,
        })

        return respond({
          type: "SIMULATE_TRANSACTION_FALLBACK_RES",
          data: simulated,
        })
      } catch (error) {
        return respond({
          type: "SIMULATE_TRANSACTION_FALLBACK_REJ",
          data: {
            error:
              (error as any)?.message?.toString() ??
              (error as any)?.toString() ??
              "Unkown error",
          },
        })
      }
    }

    case "ADD_MULTISIG_OWNERS": {
      try {
        const { address, signersToAdd, newThreshold } = msg.data

        const signersPayload = {
          entrypoint: "addSigners",
          calldata: stark.compileCalldata({
            new_threshold: newThreshold.toString(),
            signers_to_add: signersToAdd.map((signer) =>
              utils.hexlify(utils.base58.decode(signer)),
            ),
          }),
          contractAddress: address,
        }

        await actionQueue.push({
          type: "TRANSACTION",
          payload: {
            transactions: signersPayload,
            meta: {
              title: "Add multisig owners",
              type: "MULTISIG_ADD_SIGNERS",
            },
          },
        })

        return sendMessageToUi({
          type: "ADD_MULTISIG_OWNERS_RES",
        })
      } catch (e) {
        return sendMessageToUi({
          type: "ADD_MULTISIG_OWNERS_REJ",
          data: { error: `${e}` },
        })
      }
    }

    case "REMOVE_MULTISIG_OWNER": {
      try {
        const { address, signerToRemove, newThreshold } = msg.data

        const signersPayload = {
          entrypoint: "removeSigners",
          calldata: stark.compileCalldata({
            new_threshold: newThreshold.toString(),
            signers_to_remove: utils.hexlify(
              utils.base58.decode(signerToRemove),
            ),
          }),
          contractAddress: address,
        }

        await actionQueue.push({
          type: "TRANSACTION",
          payload: {
            transactions: signersPayload,
            meta: {
              title: "Remove multisig owner",
              type: "MULTISIG_REMOVE_SIGNER",
            },
          },
        })

        return sendMessageToUi({
          type: "ADD_MULTISIG_OWNERS_RES",
        })
      } catch (e) {
        return sendMessageToUi({
          type: "ADD_MULTISIG_OWNERS_REJ",
          data: { error: `${e}` },
        })
      }
    }
    case "UPDATE_MULTISIG_THRESHOLD":
      {
        try {
          const { address, newThreshold } = msg.data

          const thresholdPayload = {
            entrypoint: "changeThreshold",
            calldata: stark.compileCalldata({
              new_threshold: newThreshold.toString(),
            }),
            contractAddress: address,
          }

          await actionQueue.push({
            type: "TRANSACTION",
            payload: {
              transactions: thresholdPayload,
              meta: {
                title: "Set confirmations threshold",
                type: "MULTISIG_UPDATE_THRESHOLD",
              },
            },
          })
          return sendMessageToUi({
            type: "UPDATE_MULTISIG_THRESHOLD_RES",
          })
        } catch (e) {
          return sendMessageToUi({
            type: "UPDATE_MULTISIG_THRESHOLD_REJ",
            data: { error: `${e}` },
          })
        }
      }
      throw new UnhandledMessage()
  }
}
