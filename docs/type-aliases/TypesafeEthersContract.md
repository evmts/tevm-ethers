[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / TypesafeEthersContract

# Type Alias: TypesafeEthersContract\<TAbi\>

> **TypesafeEthersContract**\<`TAbi`\> = `BaseContract` & \{ \[TFunctionName in ExtractAbiFunctionNames\<TAbi, "pure" \| "view"\>\]: BaseContractMethod\<AbiParametersToPrimitiveTypes\<ExtractAbiFunction\<TAbi, TFunctionName\>\["inputs"\]\> & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, EthersFunctionOutput\<TAbi, TFunctionName\>\> \} & \{ \[TFunctionName in ExtractAbiFunctionNames\<TAbi, "nonpayable" \| "payable"\>\]: BaseContractMethod\<AbiParametersToPrimitiveTypes\<ExtractAbiFunction\<TAbi, TFunctionName\>\["inputs"\]\> & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, ContractTransactionResponse\> \} & `object`

Defined in: [src/contract/TypesafeEthersContract.ts:88](https://github.com/evmts/tevm-ethers/blob/main/contract/TypesafeEthersContract.ts#L88)

An ethers `BaseContract` with methods and events derived from a const ABI.

- `pure`/`view` functions resolve to their decoded return value (a single output is unwrapped;
  multiple outputs become an ethers `Result` intersected with the output tuple).
- `nonpayable`/`payable` functions resolve to a `ContractTransactionResponse`, and their
  `.staticCall()` resolves to the decoded return value.
- `queryFilter` narrows event log `args` for event names present in the ABI.

## Type Parameters

| Type Parameter |
| ------ |
| <a id="type-parameter-tabi"></a> `TAbi` *extends* `Abi` |

## Type Declaration

### queryFilter

> **queryFilter**: \<`TContractEventName`\>(`event`, `fromBlock?`, `toBlock?`) => `Promise`\<(`TContractEventName` *extends* `ExtractAbiEventNames`\<`TAbi`\> ? `EthersEventLog`\<`TAbi`, `TContractEventName`\> : `EventLog` \| `Log`)[]\>

#### Type Parameters

| Type Parameter |
| ------ |
| `TContractEventName` *extends* `Omit`\<`ContractEventName`, `ExtractAbiEventNames`\<`TAbi`\>\> \| `ExtractAbiEventNames`\<`TAbi`\> |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `TContractEventName` |
| `fromBlock?` | `BlockTag` |
| `toBlock?` | `BlockTag` |

#### Returns

`Promise`\<(`TContractEventName` *extends* `ExtractAbiEventNames`\<`TAbi`\> ? `EthersEventLog`\<`TAbi`, `TContractEventName`\> : `EventLog` \| `Log`)[]\>

## Example

```ts
import { Contract, TevmProvider, type TypesafeEthersContract } from '@tevm/ethers'

const abi = [
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'event', name: 'Transfer', inputs: [{ indexed: true, name: 'from', type: 'address' }, { indexed: true, name: 'to', type: 'address' }, { indexed: false, name: 'value', type: 'uint256' }] },
] as const

const provider = await TevmProvider.createMemoryProvider({})
const token: TypesafeEthersContract<typeof abi> = new Contract('0x0000000000000000000000000000000000000001', abi, provider)

const ok = await token.transfer.staticCall('0x0000000000000000000000000000000000000002', 1n)
console.log(ok) // boolean

const logs = await token.queryFilter('Transfer', 0, 'latest')
console.log(logs.length) // 0
```
