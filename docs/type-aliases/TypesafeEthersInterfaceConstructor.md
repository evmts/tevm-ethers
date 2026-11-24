[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / TypesafeEthersInterfaceConstructor

# Type Alias: TypesafeEthersInterfaceConstructor

> **TypesafeEthersInterfaceConstructor** = \{new \<`TAbi`\>(`abi`): [`TypesafeEthersInterface`](TypesafeEthersInterface.md)\<`TAbi`\>; new (`abi`): `Interface`; \}

Defined in: [src/contract/Contract.d.ts:27](https://github.com/evmts/tevm-ethers/blob/main/contract/Contract.d.ts#L27)

Constructor type for the typesafe [Interface](../variables/Interface.md). Carries the const ABI type through to a
[Contract](../variables/Contract.md) constructed with the interface.

## Call Signature

> **new TypesafeEthersInterfaceConstructor**\<`TAbi`\>(`abi`): [`TypesafeEthersInterface`](TypesafeEthersInterface.md)\<`TAbi`\>

### Parameters

| Parameter | Type |
| ------ | ------ |
| `abi` | `TAbi` |

### Returns

[`TypesafeEthersInterface`](TypesafeEthersInterface.md)\<`TAbi`\>

## Call Signature

> **new TypesafeEthersInterfaceConstructor**(`abi`): `Interface`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `abi` | `InterfaceAbi` |

### Returns

`Interface`

## Example

```ts
import { Interface } from '@tevm/ethers'

const abi = [{ type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }] as const
const iface = new Interface(abi)
console.log(iface.getFunction('totalSupply')?.name) // 'totalSupply'
```
