import type {
	Abi,
	AbiParametersToPrimitiveTypes,
	ExtractAbiEventNames,
	ExtractAbiFunction,
	ExtractAbiFunctionNames,
	GetEventArgs,
} from '@tevm/utils'
import type {
	BaseContract,
	BlockTag,
	ContractEventName,
	ContractTransactionResponse,
	EventLog,
	Log,
	Result,
} from 'ethers'
import type { BaseContractMethod } from './BaseContractMethod.js'

type EthersAbiParameter = {
	readonly type: string
	readonly components?: readonly EthersAbiParameter[]
}

type EthersAbiParameterToPrimitiveType<TParameter> = TParameter extends {
	readonly type: `${infer TType}[${string}]`
}
	? TParameter extends { readonly components: infer TComponents extends readonly EthersAbiParameter[] }
		? Array<EthersAbiParameterToPrimitiveType<{ readonly type: TType; readonly components: TComponents }>>
		: Array<EthersAbiParameterToPrimitiveType<{ readonly type: TType }>>
	: TParameter extends { readonly type: `uint${string}` | `int${string}` | 'uint' | 'int' }
		? bigint
		: TParameter extends { readonly type: 'bool' }
			? boolean
			: TParameter extends { readonly type: 'address' | 'string' | `bytes${string}` | 'bytes' | 'function' }
				? string
				: TParameter extends {
							readonly type: 'tuple'
							readonly components: infer TComponents extends readonly EthersAbiParameter[]
						}
					? Result & EthersAbiParametersToPrimitiveTypes<TComponents>
					: unknown

type EthersAbiParametersToPrimitiveTypes<TParameters extends readonly EthersAbiParameter[]> = {
	[TKey in keyof TParameters]: EthersAbiParameterToPrimitiveType<TParameters[TKey]>
}

type EthersFunctionOutput<TAbi extends Abi, TFunctionName extends ExtractAbiFunctionNames<TAbi>> =
	EthersAbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['outputs']> extends infer TOutputs extends
		readonly unknown[]
		? TOutputs['length'] extends 1
			? TOutputs[0]
			: Result & TOutputs
		: never

type EthersEventLog<TAbi extends Abi, TContractEventName extends ExtractAbiEventNames<TAbi>> = EventLog & {
	args: GetEventArgs<TAbi, TContractEventName>
}

/**
 * An ethers `BaseContract` with methods and events derived from a const ABI.
 *
 * - `pure`/`view` functions resolve to their decoded return value (a single output is unwrapped;
 *   multiple outputs become an ethers `Result` intersected with the output tuple).
 * - `nonpayable`/`payable` functions resolve to a `ContractTransactionResponse`, and their
 *   `.staticCall()` resolves to the decoded return value.
 * - `queryFilter` narrows event log `args` for event names present in the ABI.
 *
 * @example
 * ```ts
 * import { Contract, TevmProvider, type TypesafeEthersContract } from '@tevm/ethers'
 *
 * const abi = [
 *   { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
 *   { type: 'event', name: 'Transfer', inputs: [{ indexed: true, name: 'from', type: 'address' }, { indexed: true, name: 'to', type: 'address' }, { indexed: false, name: 'value', type: 'uint256' }] },
 * ] as const
 *
 * const provider = await TevmProvider.createMemoryProvider({})
 * const token: TypesafeEthersContract<typeof abi> = new Contract('0x0000000000000000000000000000000000000001', abi, provider)
 *
 * const ok = await token.transfer.staticCall('0x0000000000000000000000000000000000000002', 1n)
 * console.log(ok) // boolean
 *
 * const logs = await token.queryFilter('Transfer', 0, 'latest')
 * console.log(logs.length) // 0
 * ```
 */
export type TypesafeEthersContract<TAbi extends Abi> = BaseContract & {
	// readonly methods
	[TFunctionName in ExtractAbiFunctionNames<TAbi, 'pure' | 'view'>]: BaseContractMethod<
		AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['inputs']> & any[],
		EthersFunctionOutput<TAbi, TFunctionName>,
		EthersFunctionOutput<TAbi, TFunctionName>
	>
} & {
	// write methods
	[TFunctionName in ExtractAbiFunctionNames<TAbi, 'nonpayable' | 'payable'>]: BaseContractMethod<
		AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TFunctionName>['inputs']> & any[],
		EthersFunctionOutput<TAbi, TFunctionName>,
		ContractTransactionResponse
	>
} & {
	// events
	queryFilter: <
		TContractEventName extends Omit<ContractEventName, ExtractAbiEventNames<TAbi>> | ExtractAbiEventNames<TAbi>,
	>(
		event: TContractEventName,
		fromBlock?: BlockTag,
		toBlock?: BlockTag,
	) => Promise<
		Array<
			TContractEventName extends ExtractAbiEventNames<TAbi> ? EthersEventLog<TAbi, TContractEventName> : EventLog | Log
		>
	>
}
