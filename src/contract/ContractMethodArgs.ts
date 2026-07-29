import type { Overrides } from 'ethers'

/**
 * The argument tuple accepted by a contract method: the ABI-derived arguments, optionally followed
 * by an ethers `Overrides` object (`gasLimit`, `value`, `from`, ...).
 *
 * @example
 * ```ts
 * import type { ContractMethodArgs } from '@tevm/ethers'
 *
 * type TransferArgs = ContractMethodArgs<[string, bigint]>
 *
 * const withoutOverrides: TransferArgs = ['0x0000000000000000000000000000000000000001', 1n]
 * const withOverrides: TransferArgs = ['0x0000000000000000000000000000000000000001', 1n, { gasLimit: 100_000n }]
 * console.log(withoutOverrides.length, withOverrides.length) // 2 3
 * ```
 */
export type ContractMethodArgs<A extends ReadonlyArray<any>> = [...A, Overrides] | A
