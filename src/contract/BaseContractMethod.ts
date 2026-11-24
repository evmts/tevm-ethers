import type { BaseContract, ContractTransaction, ContractTransactionResponse, FunctionFragment, Result } from 'ethers'
import type { ContractMethodArgs } from './ContractMethodArgs.js'

/**
 * A typed version of an ethers contract method: callable, with `estimateGas`, `populateTransaction`,
 * `send`, `staticCall`, and `staticCallResult` attached.
 *
 * @example
 * ```ts
 * import { Contract, TevmProvider, type BaseContractMethod } from '@tevm/ethers'
 *
 * const abi = [
 *   { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
 * ] as const
 *
 * const provider = await TevmProvider.createMemoryProvider({})
 * const token = new Contract('0x0000000000000000000000000000000000000001', abi, provider)
 *
 * const transfer: BaseContractMethod<[string, bigint], boolean> = token.transfer
 * console.log(transfer.name) // 'transfer'
 * ```
 */
export type BaseContractMethod<
	TArguments extends ReadonlyArray<any> = ReadonlyArray<any>,
	TReturnType = any,
	TExtendedReturnType extends TReturnType | ContractTransactionResponse = TReturnType | ContractTransactionResponse,
> = {
	(...args: ContractMethodArgs<TArguments>): Promise<TExtendedReturnType>

	name: string

	_contract: BaseContract

	_key: string

	getFragment: (...args: ContractMethodArgs<TArguments>) => FunctionFragment
	estimateGas: (...args: ContractMethodArgs<TArguments>) => Promise<bigint>
	populateTransaction: (...args: ContractMethodArgs<TArguments>) => Promise<ContractTransaction>
	send: (...args: ContractMethodArgs<TArguments>) => Promise<ContractTransactionResponse>
	staticCall: (...args: ContractMethodArgs<TArguments>) => Promise<TReturnType>
	staticCallResult: (...args: ContractMethodArgs<TArguments>) => Promise<Result>

	readonly fragment: FunctionFragment
}
