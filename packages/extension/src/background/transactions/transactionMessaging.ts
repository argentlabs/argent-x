import {
  CallData,
  Invocations,
  TransactionType,
  hash,
  num,
  stark,
  transaction,
} from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import {
  SimulateDeployAccountRequest,
  SimulateInvokeRequest,
} from "../../shared/transactionSimulation/types"
import { getErrorObject } from "../../shared/utils/error"
import { isAccountDeployed } from "../accountDeploy"
import { HandleMessage, UnhandledMessage } from "../background"
import { isAccountV5 } from "../../shared/utils/accountv4"
import { argentMaxFee } from "../utils/argentMaxFee"
import { addEstimatedFees } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { transactionCallsAdapter } from "./transactionAdapter"
import { AccountError } from "../../shared/errors/account"
import { fetchTransactionBulkSimulation } from "../../shared/transactionSimulation/transactionSimulation.service"
import { TransactionError } from "../../shared/errors/transaction"
import { getEstimatedFeeFromSimulation } from "../../shared/transactionSimulation/utils"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({ msg, origin, background: { wallet, actionService }, respond }) => {
  switch (msg.type) {
    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: msg.data,
        },
        {
          origin,
        },
      )
      return respond({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "ESTIMATE_TRANSACTION_FEE": {
      const selectedAccount = await wallet.getSelectedAccount()
      const transactions = msg.data
      const oldAccountTransactions = transactionCallsAdapter(transactions)

      if (!selectedAccount) {
        throw new AccountError({ code: "NOT_FOUND" })
      }

      const starknetAccount = await wallet.getSelectedStarknetAccount()

      try {
        let txFee = "0",
          maxTxFee = "0",
          accountDeploymentFee: string | undefined,
          maxADFee: string | undefined

        const isDeployed = await isAccountDeployed(
          selectedAccount,
          starknetAccount.getClassAt.bind(starknetAccount),
        )

        if (!isDeployed) {
          if ("estimateFeeBulk" in starknetAccount) {
            const bulkTransactions: Invocations = [
              {
                type: TransactionType.DEPLOY_ACCOUNT,
                payload: await wallet.getAccountDeploymentPayload(
                  selectedAccount,
                ),
              },
              {
                type: TransactionType.INVOKE,
                payload: transactions,
              },
            ]

            const estimateFeeBulk = await starknetAccount.estimateFeeBulk(
              bulkTransactions,
              { skipValidate: true },
            )

            accountDeploymentFee = num.toHex(estimateFeeBulk[0].overall_fee)
            txFee = num.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = argentMaxFee(estimateFeeBulk[1].suggestedMaxFee)
          }
        } else {
          const { overall_fee, suggestedMaxFee } = isAccountV5(starknetAccount)
            ? await starknetAccount.estimateFee(transactions, {
                skipValidate: true,
              })
            : await starknetAccount.estimateFee(oldAccountTransactions)

          txFee = num.toHex(overall_fee)
          maxTxFee = num.toHex(suggestedMaxFee) // Here, maxFee = estimatedFee * 1.5x
        }

        const suggestedMaxFee = argentMaxFee(maxTxFee)

        await addEstimatedFees(
          {
            amount: txFee,
            suggestedMaxFee,
            accountDeploymentFee,
            maxADFee,
          },
          transactions,
        )
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
        const errorObject = getErrorObject(error, false)
        console.error("ESTIMATE_TRANSACTION_FEE_REJ", error, errorObject)
        return respond({
          type: "ESTIMATE_TRANSACTION_FEE_REJ",
          data: {
            error: errorObject,
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

        const maxADFee = num.toHex(
          stark.estimatedFeeToMaxFee(suggestedMaxFee, 1), // This adds the 3x overhead. i.e: suggestedMaxFee = maxFee * 2x =  estimatedFee * 3x
        )

        return respond({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES",
          data: {
            amount: num.toHex(overall_fee),
            maxADFee,
          },
        })
      } catch (error) {
        // FIXME: This is a temporary fix for the case where the user has a multisig account.
        // Once starknet 0.11 is released, we can remove this.
        if (account.type === "multisig") {
          const fallbackPrice = num.toBigInt(10e14)
          return respond({
            type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES",
            data: {
              amount: num.toHex(fallbackPrice),
              maxADFee: argentMaxFee(fallbackPrice),
            },
          })
        }

        const errorObject = getErrorObject(error, false)
        console.error("ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ", error, errorObject)
        return respond({
          type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ",
          data: {
            error: errorObject,
          },
        })
      }
    }

    case "ESTIMATE_DECLARE_CONTRACT_FEE": {
      const { address, networkId, ...rest } = msg.data

      const selectedAccount = await wallet.getSelectedAccount()
      const selectedStarknetAccount =
        address && networkId
          ? await wallet.getStarknetAccount({ address, networkId })
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
            selectedStarknetAccount.getClassAt.bind(selectedStarknetAccount),
          ))
        ) {
          if ("estimateFeeBulk" in selectedStarknetAccount) {
            const deployPayload =
              selectedAccount.type === "multisig"
                ? await wallet.getMultisigDeploymentPayload(selectedAccount)
                : await wallet.getAccountDeploymentPayload(selectedAccount)
            const bulkTransactions: Invocations = [
              {
                type: TransactionType.DEPLOY_ACCOUNT,
                payload: deployPayload,
              },
              {
                type: TransactionType.DECLARE,
                payload: {
                  ...rest,
                },
              },
            ]

            const estimateFeeBulk =
              await selectedStarknetAccount.estimateFeeBulk(bulkTransactions, {
                skipValidate: true,
              })

            accountDeploymentFee = num.toHex(estimateFeeBulk[0].overall_fee)
            txFee = num.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = estimateFeeBulk[1].suggestedMaxFee.toString()
          }
        } else {
          if ("estimateDeclareFee" in selectedStarknetAccount) {
            const { overall_fee, suggestedMaxFee } =
              await selectedStarknetAccount.estimateDeclareFee({
                ...rest,
              })
            txFee = num.toHex(overall_fee)
            maxTxFee = num.toHex(suggestedMaxFee)
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
            selectedStarknetAccount.getClassAt.bind(selectedStarknetAccount),
          ))
        ) {
          if ("estimateFeeBulk" in selectedStarknetAccount) {
            const bulkTransactions: Invocations = [
              {
                type: TransactionType.DEPLOY_ACCOUNT,
                payload: await wallet.getAccountDeploymentPayload(
                  selectedAccount,
                ),
              },
              {
                type: TransactionType.DEPLOY,
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

            accountDeploymentFee = num.toHex(estimateFeeBulk[0].overall_fee)
            txFee = num.toHex(estimateFeeBulk[1].overall_fee)

            maxADFee = argentMaxFee(estimateFeeBulk[0].suggestedMaxFee)
            maxTxFee = estimateFeeBulk[1].suggestedMaxFee.toString()
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
            txFee = num.toHex(overall_fee)
            maxTxFee = num.toHex(suggestedMaxFee)
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
        if (!selectedAccount) {
          throw new AccountError({ code: "NOT_FOUND" })
        }
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        if (!isAccountV5(starknetAccount)) {
          // Old accounts are not supported
          return respond({
            type: "SIMULATE_TRANSACTION_INVOCATION_RES",
            data: null,
          })
        }

        let nonce

        try {
          nonce = await starknetAccount.getNonce()
        } catch {
          nonce = "0"
        }

        const chainId = await starknetAccount.getChainId()

        const version = num.toHex(hash.feeTransactionVersion)

        const calldata = transaction.getExecuteCalldata(
          transactions,
          starknetAccount.cairoVersion,
        )

        let accountDeployTransaction: SimulateDeployAccountRequest | null = null

        const isDeployed = await isAccountDeployed(
          selectedAccount,
          starknetAccount.getClassAt.bind(starknetAccount),
        )

        const invokeTransactions: SimulateInvokeRequest = {
          type: TransactionType.INVOKE,
          sender_address: selectedAccount.address,
          calldata,
          signature: [],
          nonce: isDeployed ? num.toHex(nonce) : num.toHex(1),
          version,
        }

        if (!isDeployed) {
          const accountDeployPayload = await wallet.getAccountDeploymentPayload(
            selectedAccount,
          )

          accountDeployTransaction = {
            type: TransactionType.DEPLOY_ACCOUNT,
            calldata: CallData.toCalldata(
              accountDeployPayload.constructorCalldata,
            ),
            classHash: num.toHex(accountDeployPayload.classHash),
            salt: num.toHex(accountDeployPayload.addressSalt || 0),
            nonce: num.toHex(0),
            version: num.toHex(version),
            signature: [],
          }
        }

        return respond({
          type: "SIMULATE_TRANSACTION_INVOCATION_RES",
          data: {
            transactions: accountDeployTransaction
              ? [accountDeployTransaction, invokeTransactions]
              : [invokeTransactions],
            chainId,
          },
        })
      } catch (error) {
        console.error("SIMULATE_TRANSACTION_INVOCATION_REJ", error)
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

    case "SIMULATE_TRANSACTIONS": {
      const transactions = Array.isArray(msg.data) ? msg.data : [msg.data]

      try {
        const selectedAccount = await wallet.getSelectedAccount()
        if (!selectedAccount) {
          throw new AccountError({ code: "NOT_FOUND" })
        }
        const starknetAccount = await wallet.getSelectedStarknetAccount()

        if (!isAccountV5(starknetAccount)) {
          // Old accounts are not supported
          return respond({
            type: "SIMULATE_TRANSACTION_INVOCATION_RES",
            data: null,
          })
        }

        let nonce

        try {
          nonce = await starknetAccount.getNonce()
        } catch {
          nonce = "0"
        }

        const chainId = await starknetAccount.getChainId()

        const version = num.toHex(hash.feeTransactionVersion)

        const calldata = transaction.getExecuteCalldata(
          transactions,
          starknetAccount.cairoVersion,
        )

        let accountDeployTransaction: SimulateDeployAccountRequest | null = null

        const isDeployed = await isAccountDeployed(
          selectedAccount,
          starknetAccount.getClassAt.bind(starknetAccount),
        )

        const invokeTransactions: SimulateInvokeRequest = {
          type: TransactionType.INVOKE,
          sender_address: selectedAccount.address,
          calldata,
          signature: [],
          nonce: isDeployed ? num.toHex(nonce) : num.toHex(1),
          version,
        }

        if (!isDeployed) {
          const accountDeployPayload = await wallet.getAccountDeploymentPayload(
            selectedAccount,
          )

          accountDeployTransaction = {
            type: TransactionType.DEPLOY_ACCOUNT,
            calldata: CallData.toCalldata(
              accountDeployPayload.constructorCalldata,
            ),
            classHash: num.toHex(accountDeployPayload.classHash),
            salt: num.toHex(accountDeployPayload.addressSalt || 0),
            nonce: num.toHex(0),
            version: num.toHex(version),
            signature: [],
          }
        }

        const invocations = accountDeployTransaction
          ? [accountDeployTransaction, invokeTransactions]
          : [invokeTransactions]

        const result = await fetchTransactionBulkSimulation({
          invocations,
          chainId,
        })

        const estimatedFee = getEstimatedFeeFromSimulation(result)

        let simulationWithFees = null

        if (result) {
          await addEstimatedFees(estimatedFee, transactions)
          simulationWithFees = {
            simulation: result,
            feeEstimation: estimatedFee,
          }
        }

        return respond({
          type: "SIMULATE_TRANSACTIONS_RES",
          data: simulationWithFees,
        })
      } catch (error) {
        console.error("SIMULATE_TRANSACTIONS_REJ", error)
        return respond({
          type: "SIMULATE_TRANSACTIONS_REJ",
          data: {
            error: new TransactionError({
              code: "SIMULATION_ERROR",
              message: `${error}`,
            }),
          },
        })
      }
    }

    case "TRANSACTION_FAILED": {
      return await actionService.remove(msg.data.actionHash)
    }
  }
  throw new UnhandledMessage()
}
