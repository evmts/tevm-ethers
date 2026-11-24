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

declare const interfaceAbi: unique symbol
type TypesafeEthersInterface<TAbi extends Abi> = EthersInterface & { readonly [interfaceAbi]: TAbi }

/**
 * Constructor type for the typesafe {@link Interface}. Carries the const ABI type through to a
 * {@link Contract} constructed with the interface.
 * @example
 * ```ts
 * import { Interface } from '@tevm/ethers'
 *
 * const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
 * const iface = new Interface(abi)
 * console.log(iface.getFunction('totalSupply')?.name) // 'totalSupply'
 * ```
 */
type TypesafeEthersInterfaceConstructor = {
	new <TAbi extends Abi>(abi: TAbi): TypesafeEthersInterface<TAbi>
	new (abi: InterfaceAbi): EthersInterface
}

export const Interface: TypesafeEthersInterfaceConstructor

/**
 * Constructor type for the typesafe {@link Contract}. The first overload applies when a const ABI
 * (or a typed `Interface`) is passed and returns a {@link TypesafeEthersContract}; the second is the
 * untyped ethers fallback for runtime ABIs.
 * @example
 * ```ts
 * import { Contract } from '@tevm/ethers'
 *
 * const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
 * const contract = new Contract('0x0000000000000000000000000000000000001234', abi)
 * console.log((await contract.totalSupply.populateTransaction()).data) // '0x18160ddd'
 * ```
 */
type TypesafeEthersContractConstructor = {
	new <TAbi extends Abi>(
		target: string | Addressable,
		abi: TypesafeEthersInterface<TAbi> | TAbi,
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
