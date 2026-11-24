[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / ContractMethodArgs

# Type Alias: ContractMethodArgs\<A\>

> **ContractMethodArgs**\<`A`\> = \[`...A`, `Overrides`\] \| `A`

Defined in: [src/contract/ContractMethodArgs.ts:18](https://github.com/evmts/tevm-ethers/blob/main/contract/ContractMethodArgs.ts#L18)

The argument tuple accepted by a contract method: the ABI-derived arguments, optionally followed
by an ethers `Overrides` object (`gasLimit`, `value`, `from`, ...).

## Type Parameters

| Type Parameter |
| ------ |
| <a id="type-parameter-a"></a> `A` *extends* `ReadonlyArray`\<`any`\> |

## Example

```ts
import type { ContractMethodArgs } from '@tevm/ethers'

type TransferArgs = ContractMethodArgs<[string, bigint]>

const withoutOverrides: TransferArgs = ['0x0000000000000000000000000000000000000001', 1n]
const withOverrides: TransferArgs = ['0x0000000000000000000000000000000000000001', 1n, { gasLimit: 100_000n }]
console.log(withoutOverrides.length, withOverrides.length) // 2 3
```
