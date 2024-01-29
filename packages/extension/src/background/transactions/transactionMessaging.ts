import {
  CallData,
  Invocations,
  TransactionType,
  hash,
  num,
  transaction,
} from "starknet"

import { TransactionMessage } from "../../shared/messages/TransactionMessage"
import {
  SimulateDeployAccountRequest,
  SimulateInvokeRequest,
} from "../../shared/transactionSimulation/types"
import { isAccountDeployed } from "../accountDeploy"
import { HandleMessage, UnhandledMessage } from "../background"
import { AccountError } from "../../shared/errors/account"
import { fetchTransactionBulkSimulation } from "../../shared/transactionSimulation/transactionSimulation.service"
import { TransactionError } from "../../shared/errors/transaction"
import { getEstimatedFeeFromBulkSimulation } from "../../shared/transactionSimulation/utils"
import { isAccountV4, isAccountV5 } from "@argent/shared"
import { EstimatedFees } from "../../shared/transactionSimulation/fees/fees.model"
import { ETH_TOKEN_ADDRESS } from "../../shared/network/constants"
import { addEstimatedFee } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"

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
          title: "Review transaction",
          icon: "NetworkIcon",
        },
      )
      return respond({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
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

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress: ETH_TOKEN_ADDRESS,
          amount: 0n,
          pricePerUnit: 0n,
        },
      }

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

            if (
              !estimateFeeBulk[0].gas_consumed ||
              !estimateFeeBulk[0].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[0].gas_consumed or estimateFeeBulk[0].gas_price is undefined",
              )
            }

            fees.deployment = {
              feeTokenAddress: ETH_TOKEN_ADDRESS,
              amount: num.toBigInt(estimateFeeBulk[0].gas_consumed),
              pricePerUnit: num.toBigInt(estimateFeeBulk[0].gas_price),
            }

            if (
              !estimateFeeBulk[1].gas_consumed ||
              !estimateFeeBulk[1].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[1].gas_consumed or estimateFeeBulk[1].gas_price is undefined",
              )
            }

            fees.transactions.amount = num.toBigInt(
              estimateFeeBulk[1].gas_consumed,
            )
            fees.transactions.pricePerUnit = num.toBigInt(
              estimateFeeBulk[1].gas_price,
            )
          }
        } else {
          if ("estimateDeclareFee" in selectedStarknetAccount) {
            const { gas_consumed, gas_price } =
              await selectedStarknetAccount.estimateDeclareFee({
                ...rest,
              })

            if (!gas_consumed || !gas_price) {
              throw Error("gas_consumed or gas_price is undefined")
            }

            fees.transactions.amount = num.toBigInt(gas_consumed)
            fees.transactions.pricePerUnit = num.toBigInt(gas_price)
          } else {
            throw Error("estimateDeclareFee not supported")
          }
        }

        return respond({
          type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES",
          data: fees,
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

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress: ETH_TOKEN_ADDRESS,
          amount: 0n,
          pricePerUnit: 0n,
        },
      }

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

            if (
              !estimateFeeBulk[0].gas_consumed ||
              !estimateFeeBulk[0].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[0].gas_consumed or estimateFeeBulk[0].gas_price is undefined",
              )
            }

            fees.deployment = {
              feeTokenAddress: ETH_TOKEN_ADDRESS,
              amount: num.toBigInt(estimateFeeBulk[0].gas_consumed),
              pricePerUnit: num.toBigInt(estimateFeeBulk[0].gas_price),
            }

            if (
              !estimateFeeBulk[1].gas_consumed ||
              !estimateFeeBulk[1].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[1].gas_consumed or estimateFeeBulk[1].gas_price is undefined",
              )
            }

            fees.transactions.amount = num.toBigInt(
              estimateFeeBulk[1].gas_consumed,
            )
            fees.transactions.pricePerUnit = num.toBigInt(
              estimateFeeBulk[1].gas_price,
            )
          }
        } else {
          if ("estimateDeployFee" in selectedStarknetAccount) {
            const { gas_consumed, gas_price } =
              await selectedStarknetAccount.estimateDeployFee({
                classHash,
                salt,
                unique,
                constructorCalldata,
              })

            if (!gas_consumed || !gas_price) {
              throw Error("gas_consumed or gas_price is undefined")
            }

            fees.transactions.amount = num.toBigInt(gas_consumed)
            fees.transactions.pricePerUnit = num.toBigInt(gas_price)
          } else {
            throw Error("estimateDeployFee not supported")
          }
        }

        return respond({
          type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES",
          data: fees,
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
        if (isAccountV4(starknetAccount)) {
          // Old accounts are not supported
          // This should no longer happen as we prevent deprecated accounts from being used
          return respond({
            type: "SIMULATE_TRANSACTIONS_REJ",
            data: {
              error: new TransactionError({
                code: "DEPRECATED_ACCOUNT",
              }),
            },
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

        const estimatedFee = getEstimatedFeeFromBulkSimulation(result)

        let simulationWithFees = null

        if (result) {
          await addEstimatedFee(estimatedFee, transactions)
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
        console.error("SIMULATE_TRANSACTIONS_REJ", error, "kek")
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
