import { Contract as EthersContract, Interface as EthersInterface } from 'ethers'

/**
 * A drop-in replacement for the ethers [`Interface`](https://docs.ethers.org/v6/api/abi/#Interface)
 * class that preserves the const ABI in its `fragments` property.
 *
 * It is the same runtime value as `ethers.Interface` — only the type is narrowed — so there is no
 * behavioral difference and no code generation step.
 *
 * @throws {Error} If the ABI passed to the constructor is malformed (thrown by ethers).
 * @example
 * ```ts
 * import { Interface } from '@tevm/ethers'
 *
 * const abi = [
 *   {
 *     type: 'function',
 *     name: 'balanceOf',
 *     stateMutability: 'view',
 *     inputs: [{ name: 'account', type: 'address' }],
 *     outputs: [{ name: 'balance', type: 'uint256' }],
 *   },
 * ] as const
 *
 * const iface = new Interface<typeof abi>(abi)
 *
 * const data = iface.encodeFunctionData('balanceOf', ['0x0000000000000000000000000000000000000001'])
 * console.log(data.startsWith('0x70a08231')) // true
 * ```
 * @see {@link https://docs.ethers.org/v6/api/abi/#Interface | ethers Interface docs}
 */
export const Interface = /** @type {import('./Contract.js').TypesafeEthersInterfaceConstructor} */ (
	/** @type {unknown} */ (EthersInterface)
)

/**
 * A drop-in replacement for the ethers [`Contract`](https://docs.ethers.org/v6/api/contract/#Contract)
 * class that infers method names, argument types, return types, and event args from a const ABI.
 *
 * It is the same runtime value as `ethers.Contract` — only the type is narrowed. Passing a
 * non-const ABI (or an `ethers.Interface`) falls back to the untyped ethers behavior.
 *
 * @throws {Error} If the address or ABI is invalid (thrown by ethers).
 * @example
 * ```ts
 * import { Contract } from '@tevm/ethers'
 *
 * const abi = [
 *   {
 *     type: 'function',
 *     name: 'balanceOf',
 *     stateMutability: 'view',
 *     inputs: [{ name: 'account', type: 'address' }],
 *     outputs: [{ name: 'balance', type: 'uint256' }],
 *   },
 * ] as const
 *
 * const token = new Contract('0x0000000000000000000000000000000000001234', abi)
 * const request = await token.balanceOf.populateTransaction('0x0000000000000000000000000000000000000002')
 * console.log(request.data) // ABI-encoded balanceOf calldata
 * ```
 * @see {@link https://docs.ethers.org/v6/api/contract/#Contract | ethers Contract docs}
 */
export const Contract = /** @type {import('./Contract.js').TypesafeEthersContractConstructor} */ (EthersContract)
