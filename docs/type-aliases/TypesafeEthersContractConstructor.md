[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / TypesafeEthersContractConstructor

# Type Alias: TypesafeEthersContractConstructor

> **TypesafeEthersContractConstructor** = \{new \<`TAbi`\>(`target`, `abi`, `runner?`, `_deployTx?`): `BaseContract` & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, EthersFunctionOutput\<TAbi, TFunctionName\>\> \} & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, ContractTransactionResponse\> \} & `object` & `Contract`; new (`target`, `abi`, `runner?`, `_deployTx?`): `Contract`; \}

Defined in: [src/contract/Contract.d.ts:47](https://github.com/evmts/tevm-ethers/blob/main/contract/Contract.d.ts#L47)

Constructor type for the typesafe [Contract](../variables/Contract.md). The first overload applies when a const ABI
(or a typed `Interface`) is passed and returns a [TypesafeEthersContract](TypesafeEthersContract.md); the second is the
untyped ethers fallback for runtime ABIs.

## Call Signature

> **new TypesafeEthersContractConstructor**\<`TAbi`\>(`target`, `abi`, `runner?`, `_deployTx?`): `BaseContract` & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, EthersFunctionOutput\<TAbi, TFunctionName\>\> \} & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, ContractTransactionResponse\> \} & `object` & `Contract`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `string` \| `Addressable` |
| `abi` | `TAbi` \| [`TypesafeEthersInterface`](TypesafeEthersInterface.md)\<`TAbi`\> |
| `runner?` | `ContractRunner` \| `null` |
| `_deployTx?` | `TransactionResponse` \| `null` |

### Returns

`BaseContract` & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, EthersFunctionOutput\<TAbi, TFunctionName\>\> \} & \{ \[TFunctionName in string\]: BaseContractMethod\<\{ \[key in string \| number \| symbol\]: \{ \[key in string \| number \| symbol\]: AbiParameterToPrimitiveType\<(...)\[(...)\]\[key\], AbiParameterKind\> \}\[key\] \} & any\[\], EthersFunctionOutput\<TAbi, TFunctionName\>, ContractTransactionResponse\> \} & `object` & `Contract`

## Call Signature

> **new TypesafeEthersContractConstructor**(`target`, `abi`, `runner?`, `_deployTx?`): `Contract`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `target` | `string` \| `Addressable` |
| `abi` | `Interface` \| `InterfaceAbi` |
| `runner?` | `ContractRunner` \| `null` |
| `_deployTx?` | `TransactionResponse` \| `null` |

### Returns

`Contract`

## Example

```ts
import { Contract } from '@tevm/ethers'

const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
const contract = new Contract('0x0000000000000000000000000000000000001234', abi)
console.log((await contract.totalSupply.populateTransaction()).data) // '0x18160ddd'
```
