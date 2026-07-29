import type { Abi } from '@tevm/utils'
import type {
	Addressable,
	ContractRunner,
	Contract as EthersContract,
	Interface as EthersInterface,
	InterfaceAbi,
	TransactionResponse,
} from 'ethers'
import type { TypesafeEthersContract } from './TypesafeEthersContract.js'

/**
 * Constructor type for the typesafe {@link Interface}. Narrows `fragments` to the const ABI it was
 * constructed with, so ABI-derived helpers keep full type information.
 * @example
 * ```ts
 * import { Interface } from '@tevm/ethers'
 *
 * const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
 * const iface = new Interface<typeof abi>(abi)
 * console.log(iface.fragments[0].name) // 'totalSupply'
 * ```
 */
type TypesafeEthersInterfaceConstructor = {
	new <TAbi extends Abi>(abi: InterfaceAbi): Omit<EthersInterface, 'fragments'> & { fragments: TAbi }
}

export const Interface: TypesafeEthersInterfaceConstructor

/**
 * Constructor type for the typesafe {@link Contract}. The first overload applies when a const ABI
 * (or a typed `Interface`) is passed and returns a {@link TypesafeEthersContract}; the second is the
 * untyped ethers fallback for runtime ABIs.
 * @example
 * ```ts
 * import { Contract, TevmProvider } from '@tevm/ethers'
 *
 * const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
 * const provider = await TevmProvider.createMemoryProvider({})
 * const contract = new Contract('0x0000000000000000000000000000000000000001', abi, provider)
 * console.log(await contract.totalSupply()) // 0n
 * ```
 */
type TypesafeEthersContractConstructor = {
	new <TAbi extends Abi>(
		target: string | Addressable,
		abi: { fragments: TAbi } | TAbi,
		runner?: null | ContractRunner,
		_deployTx?: null | TransactionResponse,
	): TypesafeEthersContract<TAbi> & EthersContract
	new (
		target: string | Addressable,
		abi: EthersInterface | InterfaceAbi,
		runner?: null | ContractRunner,
		_deployTx?: null | TransactionResponse,
	): EthersContract
}

export const Contract: TypesafeEthersContractConstructor
