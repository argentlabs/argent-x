import {
  CallData,
  Invocations,
  TransactionType,
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
import {
  isAccountV4,
  getTxVersionFromFeeToken,
  getSimulationTxVersionFromFeeToken,
  getTxVersionFromFeeTokenForDeclareContract,
  getEstimatedFeeFromBulkSimulation,
} from "@argent/x-shared"
import { EstimatedFees } from "@argent/x-shared/simulation"
import { addEstimatedFee } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { DAPP_TRANSACTION_TITLE } from "../../shared/transactions/utils"

export const handleTransactionMessage: HandleMessage<
  TransactionMessage
> = async ({
  msg,
  origin,
  background: { wallet, actionService, feeTokenService },
  respond,
}) => {
  switch (msg.type) {
    case "EXECUTE_TRANSACTION": {
      const { meta } = await actionService.add(
        {
          type: "TRANSACTION",
          payload: msg.data,
        },
        {
          origin,
          title: DAPP_TRANSACTION_TITLE,
          icon: "NetworkIcon",
        },
      )
      return respond({
        type: "EXECUTE_TRANSACTION_RES",
        data: { actionHash: meta.hash },
      })
    }

    case "ESTIMATE_DECLARE_CONTRACT_FEE": {
      const { account, feeTokenAddress, payload } = msg.data

      const selectedAccount = await wallet.getSelectedAccount()
      const selectedStarknetAccount = account
        ? await wallet.getStarknetAccount(account)
        : await wallet.getSelectedStarknetAccount()

      if (!selectedStarknetAccount) {
        throw Error("no accounts")
      }

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress,
          amount: 0n,
          pricePerUnit: 0n,
          dataGasConsumed: 0n,
          dataGasPrice: 0n,
        },
      }

      try {
        const version = getTxVersionFromFeeTokenForDeclareContract(
          feeTokenAddress,
          payload,
        )

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
                payload,
              },
            ]

            const estimateFeeBulk =
              await selectedStarknetAccount.estimateFeeBulk(bulkTransactions, {
                skipValidate: true,
                version,
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
              feeTokenAddress,
              amount: num.toBigInt(estimateFeeBulk[0].gas_consumed),
              pricePerUnit: num.toBigInt(estimateFeeBulk[0].gas_price),
              dataGasConsumed: num.toBigInt(
                estimateFeeBulk[0].data_gas_consumed,
              ),
              dataGasPrice: num.toBigInt(estimateFeeBulk[0].data_gas_price),
            }

            if (
              !estimateFeeBulk[1].gas_consumed ||
              !estimateFeeBulk[1].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[1].gas_consumed or estimateFeeBulk[1].gas_price is undefined",
              )
            }

            const {
              gas_consumed,
              gas_price,
              data_gas_consumed,
              data_gas_price,
            } = estimateFeeBulk[1]

            fees.transactions = {
              feeTokenAddress,
              amount: num.toBigInt(gas_consumed),
              pricePerUnit: num.toBigInt(gas_price),
              dataGasConsumed: num.toBigInt(data_gas_consumed),
              dataGasPrice: num.toBigInt(data_gas_price),
            }
          }
        } else {
          if ("estimateDeclareFee" in selectedStarknetAccount) {
            const {
              gas_consumed,
              gas_price,
              data_gas_consumed,
              data_gas_price,
            } = await selectedStarknetAccount.estimateDeclareFee(payload, {
              version,
            })

            if (!gas_consumed || !gas_price) {
              throw Error("gas_consumed or gas_price is undefined")
            }

            fees.transactions = {
              feeTokenAddress,
              amount: num.toBigInt(gas_consumed),
              pricePerUnit: num.toBigInt(gas_price),
              dataGasConsumed: num.toBigInt(data_gas_consumed),
              dataGasPrice: num.toBigInt(data_gas_price),
            }
          } else {
            throw Error("estimateDeclareFee not supported")
          }
        }

        await addEstimatedFee(fees, {
          type: TransactionType.DECLARE,
          payload,
        })

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
      const { payload, account, feeTokenAddress } = msg.data

      const selectedAccount = await wallet.getSelectedAccount()
      const selectedStarknetAccount = account
        ? await wallet.getStarknetAccount(account)
        : await wallet.getSelectedStarknetAccount()

      if (!selectedStarknetAccount || !selectedAccount) {
        throw Error("no accounts")
      }

      const fees: EstimatedFees = {
        transactions: {
          feeTokenAddress,
          amount: 0n,
          pricePerUnit: 0n,
          dataGasConsumed: 0n,
          dataGasPrice: 0n,
        },
      }

      const version = getTxVersionFromFeeToken(feeTokenAddress)

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
                payload:
                  await wallet.getAccountDeploymentPayload(selectedAccount),
              },
              {
                type: TransactionType.DEPLOY,
                payload,
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
              feeTokenAddress,
              amount: num.toBigInt(estimateFeeBulk[0].gas_consumed),
              pricePerUnit: num.toBigInt(estimateFeeBulk[0].gas_price),
              dataGasConsumed: num.toBigInt(
                estimateFeeBulk[0].data_gas_consumed,
              ),
              dataGasPrice: num.toBigInt(estimateFeeBulk[0].data_gas_price),
            }

            if (
              !estimateFeeBulk[1].gas_consumed ||
              !estimateFeeBulk[1].gas_price
            ) {
              throw Error(
                "estimateFeeBulk[1].gas_consumed or estimateFeeBulk[1].gas_price is undefined",
              )
            }

            fees.transactions = {
              feeTokenAddress,
              amount: num.toBigInt(estimateFeeBulk[1].gas_consumed),
              pricePerUnit: num.toBigInt(estimateFeeBulk[1].gas_price),
              dataGasConsumed: num.toBigInt(
                estimateFeeBulk[1].data_gas_consumed,
              ),
              dataGasPrice: num.toBigInt(estimateFeeBulk[1].data_gas_price),
            }
          }
        } else {
          if ("estimateDeployFee" in selectedStarknetAccount) {
            const {
              gas_consumed,
              gas_price,
              data_gas_consumed,
              data_gas_price,
            } = await selectedStarknetAccount.estimateDeployFee(payload, {
              version,
            })

            if (!gas_consumed || !gas_price) {
              throw Error("gas_consumed or gas_price is undefined")
            }

            fees.transactions = {
              feeTokenAddress,
              amount: num.toBigInt(gas_consumed),
              pricePerUnit: num.toBigInt(gas_price),
              dataGasConsumed: num.toBigInt(data_gas_consumed),
              dataGasPrice: num.toBigInt(data_gas_price),
            }
          } else {
            throw Error("estimateDeployFee not supported")
          }
        }

        await addEstimatedFee(fees, {
          type: TransactionType.DEPLOY,
          payload,
        })

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

        if (!("transactionVersion" in starknetAccount)) {
          // Old accounts are not supported
          return respond({
            type: "SIMULATE_TRANSACTION_INVOCATION_RES",
            data: null,
          })
        }

        const nonce = await starknetAccount.getNonce().catch(() => "0")

        const chainId = await starknetAccount.getChainId()

        const bestFeeToken =
          await feeTokenService.getBestFeeToken(selectedAccount)
        const version = getSimulationTxVersionFromFeeToken(bestFeeToken.address)

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
          const accountDeployPayload =
            await wallet.getAccountDeploymentPayload(selectedAccount)

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
      const transactions = Array.isArray(msg.data.call)
        ? msg.data.call
        : [msg.data.call]

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

        const nonce = await starknetAccount.getNonce().catch(() => "0")

        const chainId = await starknetAccount.getChainId()

        const version = getSimulationTxVersionFromFeeToken(
          msg.data.feeTokenAddress,
        )
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
          const accountDeployPayload =
            await wallet.getAccountDeploymentPayload(selectedAccount)

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
          networkId: selectedAccount.networkId,
          chainId,
        })

        const estimatedFee = getEstimatedFeeFromBulkSimulation(result)

        let simulationWithFees = null

        if (result) {
          await addEstimatedFee(estimatedFee, {
            type: TransactionType.INVOKE,
            payload: transactions,
          })
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
