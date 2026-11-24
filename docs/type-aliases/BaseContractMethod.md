[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / BaseContractMethod

# Type Alias: BaseContractMethod()\<TArguments, TReturnType, TExtendedReturnType\>

> **BaseContractMethod**\<`TArguments`, `TReturnType`, `TExtendedReturnType`\> = `Promise`\<`TExtendedReturnType`\>

Defined in: [src/contract/BaseContractMethod.ts:23](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L23)

A typed version of an ethers contract method: callable, with `estimateGas`, `populateTransaction`,
`send`, `staticCall`, and `staticCallResult` attached.

## Example

```ts
import { Contract, TevmProvider, type BaseContractMethod } from '@tevm/ethers'

const abi = [
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

const provider = await TevmProvider.createMemoryProvider({})
const token = new Contract('0x0000000000000000000000000000000000000001', abi, provider)

const transfer: BaseContractMethod<[string, bigint], boolean> = token.transfer
console.log(transfer.name) // 'transfer'
```

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| <a id="type-parameter-targuments"></a> `TArguments` *extends* `ReadonlyArray`\<`any`\> | `ReadonlyArray`\<`any`\> |
| <a id="type-parameter-treturntype"></a> `TReturnType` | `any` |
| <a id="type-parameter-textendedreturntype"></a> `TExtendedReturnType` *extends* `TReturnType` \| `ContractTransactionResponse` | `TReturnType` \| `ContractTransactionResponse` |

> **BaseContractMethod**(...`args`): `Promise`\<`TExtendedReturnType`\>

A typed version of an ethers contract method: callable, with `estimateGas`, `populateTransaction`,
`send`, `staticCall`, and `staticCallResult` attached.

## Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | [`ContractMethodArgs`](ContractMethodArgs.md)\<`TArguments`\> |

## Returns

`Promise`\<`TExtendedReturnType`\>

## Example

```ts
import { Contract, TevmProvider, type BaseContractMethod } from '@tevm/ethers'

const abi = [
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

const provider = await TevmProvider.createMemoryProvider({})
const token = new Contract('0x0000000000000000000000000000000000000001', abi, provider)

const transfer: BaseContractMethod<[string, bigint], boolean> = token.transfer
console.log(transfer.name) // 'transfer'
```

## Properties

| Property | Modifier | Type | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="_contract"></a> `_contract` | `public` | `BaseContract` | [src/contract/BaseContractMethod.ts:32](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L32) |
| <a id="_key"></a> `_key` | `public` | `string` | [src/contract/BaseContractMethod.ts:34](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L34) |
| <a id="estimategas"></a> `estimateGas` | `public` | (...`args`) => `Promise`\<`bigint`\> | [src/contract/BaseContractMethod.ts:37](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L37) |
| <a id="fragment"></a> `fragment` | `readonly` | `FunctionFragment` | [src/contract/BaseContractMethod.ts:43](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L43) |
| <a id="getfragment"></a> `getFragment` | `public` | (...`args`) => `FunctionFragment` | [src/contract/BaseContractMethod.ts:36](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L36) |
| <a id="name"></a> `name` | `public` | `string` | [src/contract/BaseContractMethod.ts:30](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L30) |
| <a id="populatetransaction"></a> `populateTransaction` | `public` | (...`args`) => `Promise`\<`ContractTransaction`\> | [src/contract/BaseContractMethod.ts:38](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L38) |
| <a id="send"></a> `send` | `public` | (...`args`) => `Promise`\<`ContractTransactionResponse`\> | [src/contract/BaseContractMethod.ts:39](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L39) |
| <a id="staticcall"></a> `staticCall` | `public` | (...`args`) => `Promise`\<`TReturnType`\> | [src/contract/BaseContractMethod.ts:40](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L40) |
| <a id="staticcallresult"></a> `staticCallResult` | `public` | (...`args`) => `Promise`\<`Result`\> | [src/contract/BaseContractMethod.ts:41](https://github.com/evmts/tevm-ethers/blob/main/contract/BaseContractMethod.ts#L41) |
