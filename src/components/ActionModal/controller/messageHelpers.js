import { getTop5Delegations } from "../../../utils/"
import transaction from "./transactionTypes"
import { uatoms } from "scripts/num.js"

function createSendTransaction(context, { toAddress, amount, denom }) {
  return { toAddress, amounts: [{ amount: String(uatoms(amount)), denom }] }
}

// If given a single address, withdraw from there,
// else assume the user wants to withdraw from all validators
function createWithdrawTransaction(context, { validatorAddress }) {
  let validatorAddresses
  if (validatorAddress) {
    validatorAddresses = [validatorAddress]
  } else {
    const top5Delegations = getTop5Delegations(context.committedDelegations)
    validatorAddresses = Object.keys(top5Delegations)
  }

  return { validatorAddresses }
}

function createDelegateTransaction(context, { validatorAddress, amount }) {
  return { validatorAddress, amount: String(uatoms(amount)) }
}

function createUndelegateTransaction(context, { validatorAddress, amount }) {
  return { validatorAddress, amount: String(uatoms(amount)) }
}

function createRedelegateTransaction(
  context,
  { validatorSrc, validatorDst, amount }
) {
  return { validatorSrc, validatorDst, amount: String(uatoms(amount)) }
}

function createSubmitProposalTransaction(
  context,
  { title, description, denom, amount }
) {
  return {
    title,
    description,
    initialDeposits: [{ amount: String(uatoms(amount)), denom }]
  }
}

function createVoteTransaction(context, { proposalId, option }) {
  return { proposalId, option }
}

function createDepositTransaction(context, { proposalId, amount, denom }) {
  return { proposalId, amounts: [{ amount: String(uatoms(amount)), denom }] }
}

export function createMessageArguments(
  context,
  type,
  properties,
  simulation = false
) {
  let tx
  switch (type) {
    case transaction.SEND:
      tx = createSendTransaction(context, properties)
      break
    case transaction.WITHDRAW:
      tx = createWithdrawTransaction(context, properties)
      break
    case transaction.DELEGATE:
      tx = createDelegateTransaction(context, properties)
      break
    case transaction.UNDELEGATE:
      tx = createUndelegateTransaction(context, properties)
      break
    case transaction.REDELEGATE:
      tx = createRedelegateTransaction(context, properties)
      break
    case transaction.SUBMIT_PROPOSAL:
      tx = createSubmitProposalTransaction(context, properties)
      break
    case transaction.VOTE:
      tx = createVoteTransaction(context, properties)
      break
    case transaction.DEPOSIT:
      tx = createDepositTransaction(context, properties)
      break
    default:
      tx = null
  }

  // When simulating a withdrawal, ignore validator addresses
  if (type === transaction.WITHDRAW && simulation && tx) {
    tx = {
      ...tx,
      validatorAddress: []
    }
  }

  return tx
}

// Withdrawing is a multi message for all validators you have bonds with
export function createMultiMessage(cosmos, type, senderAddress, txArguments) {
  const messages = txArguments.validatorAddresses.map(validatorAddress =>
    cosmos[type](senderAddress, { validatorAddress })
  )
  return cosmos.MultiMessage(senderAddress, messages)
}

export function createMessage(cosmos, type, senderAddress, txArguments) {
  return cosmos[type](senderAddress, txArguments)
}

export function convertGasPriceData(gasPrices) {
  const g = gasPrices.map(({ amount, denom }) => {
    return {
      amount: String(uatoms(amount)),
      denom
    }
  })
  console.log(g)
  return g
}
