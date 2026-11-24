[**@tevm/ethers**](../README.md)

***

[@tevm/ethers](../globals.md) / TevmProvider

# Class: TevmProvider

Defined in: [src/TevmProvider.js:110](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L110)

An [ethers JsonRpcApiProvider](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcApiProvider) backed by a Tevm node.

## TevmProvider

`TevmProvider` is a normal ethers v6 provider whose JSON-RPC backend is an in-process Tevm EVM
instead of a remote node. No server, no socket, no `anvil`. Use [TevmProvider.createMemoryProvider](#creatememoryprovider)
to create a provider with a fresh in-memory node, or pass an existing Tevm node to the constructor.

## Examples

```typescript
import { TevmProvider } from '@tevm/ethers'

const provider = await TevmProvider.createMemoryProvider({
  miningConfig: { type: 'auto' },
})

console.log(await provider.send('eth_chainId', [])) // '0x384'
console.log(await provider.getBlockNumber()) // 0
```

## Forking a live network

```typescript
import { TevmProvider } from '@tevm/ethers'
import { http } from 'viem'

const provider = await TevmProvider.createMemoryProvider({
  fork: { transport: http('https://mainnet.optimism.io')({}) },
})

const blockNumber = await provider.getBlockNumber()
console.log(blockNumber) // the forked block height
```

## Using an existing Tevm node

The constructor accepts any Tevm node extended with `tevmActions()` and `tevmSend()`, which lets
several providers (or a viem client and an ethers provider) share one EVM instance.

```typescript
import { TevmProvider } from '@tevm/ethers'
import { tevmActions, tevmSend } from '@tevm/decorators'
import { createTevmNode } from '@tevm/node'

const node = createTevmNode().extend(tevmActions()).extend(tevmSend())

const provider = new TevmProvider(node)
console.log(await provider.getBlockNumber()) // 0
```

## Tevm actions support

The Tevm action API is available on the [TevmProvider#tevm](#tevm) property.

```typescript
import { TevmProvider } from '@tevm/ethers'
import { createContract } from '@tevm/contract'

const provider = await TevmProvider.createMemoryProvider({})

const addContract = createContract({
  name: 'AddContract',
  humanReadableAbi: ['function add(uint256 a, uint256 b) public pure returns (uint256)'],
  address: `0x${'42'.repeat(20)}`,
  deployedBytecode:
    '0x608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063771602f71461002d575b5f80fd5b610047600480360381019061004291906100a9565b61005d565b60405161005491906100f6565b60405180910390f35b5f818361006a919061013c565b905092915050565b5f80fd5b5f819050919050565b61008881610076565b8114610092575f80fd5b50565b5f813590506100a38161007f565b92915050565b5f80604083850312156100bf576100be610072565b5b5f6100cc85828601610095565b92505060206100dd85828601610095565b9150509250929050565b6100f081610076565b82525050565b5f6020820190506101095f8301846100e7565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61014682610076565b915061015183610076565b92508282019050808211156101695761016861010f565b5b9291505056fea2646970667358221220a8f4b7187c62760aefc097c1827799c61a6df322acc9d7575862a525f9aa59a364736f6c63430008170033',
})

await provider.tevm.setAccount({
  address: addContract.address,
  deployedBytecode: addContract.deployedBytecode,
})

const result = await provider.tevm.contract(addContract.read.add(390n, 30n))
console.log(result.data) // 420n
```

## Tevm JSON-RPC support

`provider.send` accepts the Tevm JSON-RPC methods (`tevm_setAccount`, `tevm_getAccount`,
`tevm_call`, `tevm_mine`, `tevm_dumpState`, `tevm_loadState`) in addition to the standard
`eth_*` methods.

```typescript
import { TevmProvider } from '@tevm/ethers'
import { toHex } from '@tevm/utils'

const provider = await TevmProvider.createMemoryProvider({})

await provider.send('tevm_setAccount', [
  { address: `0x${'69'.repeat(20)}`, nonce: toHex(1n), balance: toHex(420n) },
])

const account = await provider.send('tevm_getAccount', [{ address: `0x${'69'.repeat(20)}` }])
console.log(account.balance) // '0x1a4'
```

## See

 - [Tevm Node docs](https://node.tevm.sh)
 - [ethers v6 docs](https://docs.ethers.org/v6/)

## Extends

- `JsonRpcApiProvider`

## Constructors

### Constructor

> **new TevmProvider**(`client`): `TevmProvider`

Defined in: [src/TevmProvider.js:191](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L191)

Wraps an existing Tevm node (or any object exposing one on a `tevm` property) in an ethers provider.

Batching and response caching are disabled because the backend is in-process: requests are
already effectively free and caching would hide state mutations made through `provider.tevm`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | `TevmSendApi` & `TevmActionsApi` \| \{ `tevm`: `TevmSendApi` & `TevmActionsApi`; \} | A Tevm node extended with `tevmSend()` and `tevmActions()`, or a client exposing one as `.tevm`. |

#### Returns

`TevmProvider`

#### Throws

If `client` neither implements `send`/`sendBulk` nor exposes a node on a `tevm` property.

#### Example

```ts
import { TevmProvider } from '@tevm/ethers'
import { tevmActions, tevmSend } from '@tevm/decorators'
import { createTevmNode } from '@tevm/node'

const node = createTevmNode().extend(tevmActions()).extend(tevmSend())

const provider = new TevmProvider(node)
console.log(await provider.getBlockNumber()) // 0
```

#### Overrides

`JsonRpcApiProvider.constructor`

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="tevm"></a> `tevm` | `TevmSendApi` & `TevmActionsApi` | The Tevm action + JSON-RPC API of the underlying node. Every Tevm action handler is available here: `call`, `contract`, `deploy`, `deal`, `mine`, `getAccount`, `setAccount`, `dumpState`, `loadState`, plus `send`/`sendBulk` for raw JSON-RPC. **Example** `import { TevmProvider } from '@tevm/ethers' const provider = await TevmProvider.createMemoryProvider({}) await provider.tevm.setAccount({ address: `0x${'69'.repeat(20)}`, balance: 420n }) const account = await provider.tevm.getAccount({ address: `0x${'69'.repeat(20)}` }) console.log(account.balance) // 420n` **See** [Tevm actions reference](https://node.tevm.sh/api/actions) | [src/TevmProvider.js:169](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L169) |

## Accessors

### \_network

#### Get Signature

> **get** **\_network**(): `Network`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:235](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L235)

Gets the [[Network]] this provider has committed to. On each call, the network
 is detected, and if it has changed, the call will reject.

##### Returns

`Network`

#### Inherited from

`JsonRpcApiProvider._network`

***

### \_requestRate

#### Get Signature

> **get** **\_requestRate**(): `number` \| `null`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:263](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L263)

Limit the number of requests per second. (default: no limit)

##### Returns

`number` \| `null`

#### Set Signature

> **set** **\_requestRate**(`value`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:264](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L264)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `number` \| `null` |

##### Returns

`void`

#### Inherited from

`JsonRpcApiProvider._requestRate`

***

### destroyed

#### Get Signature

> **get** **destroyed**(): `boolean`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:424](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L424)

If this provider has been destroyed using the [[destroy]] method.

 Once destroyed, all resources are reclaimed, internal event loops
 and timers are cleaned up and no further requests may be sent to
 the provider.

##### Returns

`boolean`

#### Inherited from

`JsonRpcApiProvider.destroyed`

***

### disableCcipRead

#### Get Signature

> **get** **disableCcipRead**(): `boolean`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:287](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L287)

Prevent any CCIP-read operation, regardless of whether requested
 in a [[call]] using ``enableCcipRead``.

##### Returns

`boolean`

#### Set Signature

> **set** **disableCcipRead**(`value`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:288](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L288)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `boolean` |

##### Returns

`void`

#### Inherited from

`JsonRpcApiProvider.disableCcipRead`

***

### paused

#### Get Signature

> **get** **paused**(): `boolean`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:443](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L443)

Whether the provider is currently paused.

 A paused provider will not emit any events, and generally should
 not make any requests to the network, but that is up to sub-classes
 to manage.

 Setting ``paused = true`` is identical to calling ``.pause(false)``,
 which will buffer any events that occur while paused until the
 provider is unpaused.

##### Returns

`boolean`

#### Set Signature

> **set** **paused**(`pause`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:444](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L444)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `pause` | `boolean` |

##### Returns

`void`

#### Inherited from

`JsonRpcApiProvider.paused`

***

### plugins

#### Get Signature

> **get** **plugins**(): `AbstractProviderPlugin`[]

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:274](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L274)

Returns all the registered plug-ins.

##### Returns

`AbstractProviderPlugin`[]

#### Inherited from

`JsonRpcApiProvider.plugins`

***

### pollingInterval

#### Get Signature

> **get** **pollingInterval**(): `number`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:265](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L265)

##### Returns

`number`

#### Inherited from

`JsonRpcApiProvider.pollingInterval`

***

### provider

#### Get Signature

> **get** **provider**(): `this`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:270](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L270)

Returns ``this``, to allow an **AbstractProvider** to implement
 the [[ContractRunner]] interface.

##### Returns

`this`

#### Inherited from

`JsonRpcApiProvider.provider`

***

### ready

#### Get Signature

> **get** **ready**(): `boolean`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:281](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L281)

Returns true only if the [[_start]] has been called.

##### Returns

`boolean`

#### Inherited from

`JsonRpcApiProvider.ready`

## Methods

### \_clearTimeout()

> **\_clearTimeout**(`timerId`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:379](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L379)

Clear a timer created using the [[_setTimeout]] method.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `timerId` | `number` |

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider._clearTimeout`

***

### \_detectNetwork()

> **\_detectNetwork**(): `Promise`\<`Network`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:256](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L256)

Sub-classes may override this; it detects the *actual* network that
 we are **currently** connected to.

 Keep in mind that [[send]] may only be used once [[ready]], otherwise the
 _send primitive must be used instead.

#### Returns

`Promise`\<`Network`\>

#### Inherited from

`JsonRpcApiProvider._detectNetwork`

***

### \_forEachSubscriber()

> **\_forEachSubscriber**(`func`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:392](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L392)

Perform %%func%% on each subscriber.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `func` | (`s`) => `void` |

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider._forEachSubscriber`

***

### \_getAddress()

> **\_getAddress**(`address`): `string` \| `Promise`\<`string`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:337](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L337)

Returns or resolves to the address for %%address%%, resolving ENS
 names and [[Addressable]] objects and returning if already an
 address.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `AddressLike` |

#### Returns

`string` \| `Promise`\<`string`\>

#### Inherited from

`JsonRpcApiProvider._getAddress`

***

### \_getBlockTag()

> **\_getBlockTag**(`blockTag?`): `string` \| `Promise`\<`string`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:342](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L342)

Returns or resolves to a valid block tag for %%blockTag%%, resolving
 negative values and returning if already a valid block tag.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `blockTag?` | `BlockTag` |

#### Returns

`string` \| `Promise`\<`string`\>

#### Inherited from

`JsonRpcApiProvider._getBlockTag`

***

### \_getFilter()

> **\_getFilter**(`filter`): `PerformActionFilter` \| `Promise`\<`PerformActionFilter`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:348](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L348)

Returns or resolves to a filter for %%filter%%, resolving any ENS
 names or [[Addressable]] object and returning if already a valid
 filter.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `filter` | `Filter` \| `FilterByBlockHash` |

#### Returns

`PerformActionFilter` \| `Promise`\<`PerformActionFilter`\>

#### Inherited from

`JsonRpcApiProvider._getFilter`

***

### \_getOption()

> **\_getOption**\<`K`\>(`key`): `JsonRpcApiProviderOptions`\[`K`\]

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:230](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L230)

Returns the value associated with the option %%key%%.

 Sub-classes can use this to inquire about configuration options.

#### Type Parameters

| Type Parameter |
| ------ |
| <a id="type-parameter-k"></a> `K` *extends* keyof `JsonRpcApiProviderOptions` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `K` |

#### Returns

`JsonRpcApiProviderOptions`\[`K`\]

#### Inherited from

`JsonRpcApiProvider._getOption`

***

### \_getProvider()

> **\_getProvider**(`chainId`): `AbstractProvider`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:369](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L369)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `chainId` | `number` |

#### Returns

`AbstractProvider`

#### Inherited from

`JsonRpcApiProvider._getProvider`

***

### \_getSubscriber()

> **\_getSubscriber**(`sub`): `Subscriber`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:277](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L277)

Return a Subscriber that will manage the %%sub%%.

 Sub-classes may override this to modify the behavior of
 subscription management.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `sub` | `Subscription` |

#### Returns

`Subscriber`

#### Inherited from

`JsonRpcApiProvider._getSubscriber`

***

### \_getTransactionRequest()

> **\_getTransactionRequest**(`_request`): `PerformActionTransaction` \| `Promise`\<`PerformActionTransaction`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:354](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L354)

Returns or resolves to a transaction for %%request%%, resolving
 any ENS names or [[Addressable]] and returning if already a valid
 transaction.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_request` | `TransactionRequest` |

#### Returns

`PerformActionTransaction` \| `Promise`\<`PerformActionTransaction`\>

#### Inherited from

`JsonRpcApiProvider._getTransactionRequest`

***

### \_perform()

> **\_perform**(`req`): `Promise`\<`any`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:248](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L248)

Resolves to the non-normalized value by performing %%req%%.

 Sub-classes may override this to modify behavior of actions,
 and should generally call ``super._perform`` as a fallback.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `req` | `PerformActionRequest` |

#### Returns

`Promise`\<`any`\>

#### Inherited from

`JsonRpcApiProvider._perform`

***

### \_recoverSubscriber()

> **\_recoverSubscriber**(`oldSub`, `newSub`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:407](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L407)

If a [[Subscriber]] fails and needs to replace itself, this
 method may be used.

 For example, this is used for providers when using the
 ``eth_getFilterChanges`` method, which can return null if state
 filters are not supported by the backend, allowing the Subscriber
 to swap in a [[PollingEventSubscriber]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `oldSub` | `Subscriber` |
| `newSub` | `Subscriber` |

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider._recoverSubscriber`

***

### \_send()

> **\_send**(`payload`): `Promise`\<(`JsonRpcResult` \| `JsonRpcError`)[]\>

Defined in: [src/TevmProvider.js:232](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L232)

Sends a JSON-RPC payload (or a batch) to the underlying Tevm node.

Called by ethers internals; prefer `provider.send(method, params)` in application code.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `JsonRpcPayload` \| `JsonRpcPayload`[] |

#### Returns

`Promise`\<(`JsonRpcResult` \| `JsonRpcError`)[]\>

#### Throws

If the underlying node rejects the request (transport-level failure). Method-level
failures are returned as JSON-RPC error objects rather than thrown.

#### Example

```ts
import { TevmProvider } from '@tevm/ethers'

const provider = await TevmProvider.createMemoryProvider({})

// `send` is the public API; it delegates to `_send` under the hood
console.log(await provider.send('eth_chainId', [])) // '0x384'
```

#### Overrides

`JsonRpcApiProvider._send`

***

### \_setTimeout()

> **\_setTimeout**(`_func`, `timeout?`): `number`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:388](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L388)

Create a timer that will execute %%func%% after at least %%timeout%%
 (in ms). If %%timeout%% is unspecified, then %%func%% will execute
 in the next event loop.

 [Pausing](AbstractProvider-paused) the provider will pause any
 associated timers.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_func` | () => `void` |
| `timeout?` | `number` |

#### Returns

`number`

#### Inherited from

`JsonRpcApiProvider._setTimeout`

***

### \_start()

> **\_start**(): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:264](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L264)

Sub-classes **MUST** call this. Until [[_start]] has been called, no calls
 will be passed to [[_send]] from [[send]]. If it is overridden, then
 ``super._start()`` **MUST** be called.

 Calling it multiple times is safe and has no effect.

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider._start`

***

### \_waitUntilReady()

> **\_waitUntilReady**(): `Promise`\<`void`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:270](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L270)

Resolves once the [[_start]] has been called. This can be used in
 sub-classes to defer sending data until the connection has been
 established.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JsonRpcApiProvider._waitUntilReady`

***

### \_wrapBlock()

> **\_wrapBlock**(`value`, `network`): `Block`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:298](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L298)

Provides the opportunity for a sub-class to wrap a block before
 returning it, to add additional properties or an alternate
 sub-class of [[Block]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `BlockParams` |
| `network` | `Network` |

#### Returns

`Block`

#### Inherited from

`JsonRpcApiProvider._wrapBlock`

***

### \_wrapLog()

> **\_wrapLog**(`value`, `network`): `Log`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:304](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L304)

Provides the opportunity for a sub-class to wrap a log before
 returning it, to add additional properties or an alternate
 sub-class of [[Log]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `LogParams` |
| `network` | `Network` |

#### Returns

`Log`

#### Inherited from

`JsonRpcApiProvider._wrapLog`

***

### \_wrapTransactionReceipt()

> **\_wrapTransactionReceipt**(`value`, `network`): `TransactionReceipt`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:310](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L310)

Provides the opportunity for a sub-class to wrap a transaction
 receipt before returning it, to add additional properties or an
 alternate sub-class of [[TransactionReceipt]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `TransactionReceiptParams` |
| `network` | `Network` |

#### Returns

`TransactionReceipt`

#### Inherited from

`JsonRpcApiProvider._wrapTransactionReceipt`

***

### \_wrapTransactionResponse()

> **\_wrapTransactionResponse**(`tx`, `network`): `TransactionResponse`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:316](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L316)

Provides the opportunity for a sub-class to wrap a transaction
 response before returning it, to add additional properties or an
 alternate sub-class of [[TransactionResponse]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tx` | `TransactionResponseParams` |
| `network` | `Network` |

#### Returns

`TransactionResponse`

#### Inherited from

`JsonRpcApiProvider._wrapTransactionResponse`

***

### addListener()

> **addListener**(`event`, `listener`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:415](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L415)

Alias for [[on]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| `listener` | `Listener` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.addListener`

***

### attachPlugin()

> **attachPlugin**(`plugin`): `this`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:278](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L278)

Attach a new plug-in.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `plugin` | `AbstractProviderPlugin` |

#### Returns

`this`

#### Inherited from

`JsonRpcApiProvider.attachPlugin`

***

### broadcastTransaction()

> **broadcastTransaction**(`signedTx`): `Promise`\<`TransactionResponse`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:363](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L363)

Broadcasts the %%signedTx%% to the network, adding it to the
 memory pool of any node for which the transaction meets the
 rebroadcast requirements.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `signedTx` | `string` |

#### Returns

`Promise`\<`TransactionResponse`\>

#### Inherited from

`JsonRpcApiProvider.broadcastTransaction`

***

### call()

> **call**(`_tx`): `Promise`\<`string`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:358](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L358)

Simulate the execution of %%tx%%. If the call reverts, it will
 throw a [[CallExceptionError]] which includes the revert data.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_tx` | `TransactionRequest` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

`JsonRpcApiProvider.call`

***

### ccipReadFetch()

> **ccipReadFetch**(`tx`, `calldata`, `urls`): `Promise`\<`string` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:292](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L292)

Resolves to the data for executing the CCIP-read operations.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tx` | `PerformActionTransaction` |
| `calldata` | `string` |
| `urls` | `string`[] |

#### Returns

`Promise`\<`string` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.ccipReadFetch`

***

### destroy()

> **destroy**(): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:331](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L331)

Sub-classes may use this to shutdown any sockets or release their
 resources and reject any pending requests.

 Sub-classes **must** call ``super.destroy()``.

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider.destroy`

***

### emit()

> **emit**(`event`, ...`args`): `Promise`\<`boolean`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:410](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L410)

Triggers each listener for %%event%% with the %%args%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| ...`args` | `any`[] |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

`JsonRpcApiProvider.emit`

***

### estimateGas()

> **estimateGas**(`_tx`): `Promise`\<`bigint`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:357](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L357)

Estimates the amount of gas required to execute %%tx%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_tx` | `TransactionRequest` |

#### Returns

`Promise`\<`bigint`\>

#### Inherited from

`JsonRpcApiProvider.estimateGas`

***

### getAvatar()

> **getAvatar**(`name`): `Promise`\<`string` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:371](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L371)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`Promise`\<`string` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getAvatar`

***

### getBalance()

> **getBalance**(`address`, `blockTag?`): `Promise`\<`bigint`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:359](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L359)

Get the account balance (in wei) of %%address%%. If %%blockTag%%
 is specified and the node supports archive access for that
 %%blockTag%%, the balance is as of that [[BlockTag]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `AddressLike` |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`\<`bigint`\>

#### Note

On nodes without archive access enabled, the %%blockTag%% may be
       **silently ignored** by the node, which may cause issues if relied on.

#### Inherited from

`JsonRpcApiProvider.getBalance`

***

### getBlock()

> **getBlock**(`block`, `prefetchTxs?`): `Promise`\<`Block` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:364](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L364)

Resolves to the block for %%blockHashOrBlockTag%%.

 If %%prefetchTxs%%, and the backend supports including transactions
 with block requests, all transactions will be included and the
 [[Block]] object will not need to make remote calls for getting
 transactions.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `block` | `BlockTag` |
| `prefetchTxs?` | `boolean` |

#### Returns

`Promise`\<`Block` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getBlock`

***

### getBlockNumber()

> **getBlockNumber**(): `Promise`\<`number`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:331](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L331)

Get the current block number.

#### Returns

`Promise`\<`number`\>

#### Inherited from

`JsonRpcApiProvider.getBlockNumber`

***

### getCode()

> **getCode**(`address`, `blockTag?`): `Promise`\<`string`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:361](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L361)

Get the bytecode for %%address%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `AddressLike` |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`\<`string`\>

#### Note

On nodes without archive access enabled, the %%blockTag%% may be
       **silently ignored** by the node, which may cause issues if relied on.

#### Inherited from

`JsonRpcApiProvider.getCode`

***

### getFeeData()

> **getFeeData**(): `Promise`\<`FeeData`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:356](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L356)

Get the best guess at the recommended [[FeeData]].

#### Returns

`Promise`\<`FeeData`\>

#### Inherited from

`JsonRpcApiProvider.getFeeData`

***

### getLogs()

> **getLogs**(`_filter`): `Promise`\<`Log`[]\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:368](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L368)

Resolves to the list of Logs that match %%filter%%

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `_filter` | `Filter` \| `FilterByBlockHash` |

#### Returns

`Promise`\<`Log`[]\>

#### Inherited from

`JsonRpcApiProvider.getLogs`

***

### getNetwork()

> **getNetwork**(): `Promise`\<`Network`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:355](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L355)

Get the connected [[Network]].

#### Returns

`Promise`\<`Network`\>

#### Inherited from

`JsonRpcApiProvider.getNetwork`

***

### getPlugin()

> **getPlugin**\<`T`\>(`name`): `T` \| `null`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:282](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L282)

Get a plugin by name.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| <a id="type-parameter-t"></a> `T` *extends* `AbstractProviderPlugin` | `AbstractProviderPlugin` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`T` \| `null`

#### Inherited from

`JsonRpcApiProvider.getPlugin`

***

### getResolver()

> **getResolver**(`name`): `Promise`\<`EnsResolver` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:370](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L370)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |

#### Returns

`Promise`\<`EnsResolver` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getResolver`

***

### getRpcError()

> **getRpcError**(`payload`, `_error`): `Error`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:302](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L302)

Returns an ethers-style Error for the given JSON-RPC error
 %%payload%%, coalescing the various strings and error shapes
 that different nodes return, coercing them into a machine-readable
 standardized error.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `payload` | `JsonRpcPayload` |
| `_error` | `JsonRpcError` |

#### Returns

`Error`

#### Inherited from

`JsonRpcApiProvider.getRpcError`

***

### getRpcRequest()

> **getRpcRequest**(`req`): \{ `args`: `any`[]; `method`: `string`; \} \| `null`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:292](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L292)

Returns the request method and arguments required to perform
 %%req%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `req` | `PerformActionRequest` |

#### Returns

\{ `args`: `any`[]; `method`: `string`; \} \| `null`

#### Inherited from

`JsonRpcApiProvider.getRpcRequest`

***

### getRpcTransaction()

> **getRpcTransaction**(`tx`): `JsonRpcTransactionRequest`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:287](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L287)

Returns %%tx%% as a normalized JSON-RPC transaction request,
 which has all values hexlified and any numeric values converted
 to Quantity values.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tx` | `TransactionRequest` |

#### Returns

`JsonRpcTransactionRequest`

#### Inherited from

`JsonRpcApiProvider.getRpcTransaction`

***

### getSigner()

> **getSigner**(`address?`): `Promise`\<`JsonRpcSigner`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:329](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L329)

Resolves to the [[Signer]] account for  %%address%% managed by
 the client.

 If the %%address%% is a number, it is used as an index in the
 the accounts from [[listAccounts]].

 This can only be used on clients which manage accounts (such as
 Geth with imported account or MetaMask).

 Throws if the account doesn't exist.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address?` | `string` \| `number` |

#### Returns

`Promise`\<`JsonRpcSigner`\>

#### Inherited from

`JsonRpcApiProvider.getSigner`

***

### getStorage()

> **getStorage**(`address`, `_position`, `blockTag?`): `Promise`\<`string`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:362](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L362)

Get the storage slot value for %%address%% at slot %%position%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `AddressLike` |
| `_position` | `BigNumberish` |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`\<`string`\>

#### Note

On nodes without archive access enabled, the %%blockTag%% may be
       **silently ignored** by the node, which may cause issues if relied on.

#### Inherited from

`JsonRpcApiProvider.getStorage`

***

### getTransaction()

> **getTransaction**(`hash`): `Promise`\<`TransactionResponse` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:365](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L365)

Resolves to the transaction for %%hash%%.

 If the transaction is unknown or on pruning nodes which
 discard old transactions this resolves to ``null``.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `string` |

#### Returns

`Promise`\<`TransactionResponse` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getTransaction`

***

### getTransactionCount()

> **getTransactionCount**(`address`, `blockTag?`): `Promise`\<`number`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:360](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L360)

Get the number of transactions ever sent for %%address%%, which
 is used as the ``nonce`` when sending a transaction. If
 %%blockTag%% is specified and the node supports archive access
 for that %%blockTag%%, the transaction count is as of that
 [[BlockTag]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `AddressLike` |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`\<`number`\>

#### Note

On nodes without archive access enabled, the %%blockTag%% may be
       **silently ignored** by the node, which may cause issues if relied on.

#### Inherited from

`JsonRpcApiProvider.getTransactionCount`

***

### getTransactionReceipt()

> **getTransactionReceipt**(`hash`): `Promise`\<`TransactionReceipt` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:366](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L366)

Resolves to the transaction receipt for %%hash%%, if mined.

 If the transaction has not been mined, is unknown or on
 pruning nodes which discard old transactions this resolves to
 ``null``.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `string` |

#### Returns

`Promise`\<`TransactionReceipt` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getTransactionReceipt`

***

### getTransactionResult()

> **getTransactionResult**(`hash`): `Promise`\<`string` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:367](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L367)

Resolves to the result returned by the executions of %%hash%%.

 This is only supported on nodes with archive access and with
 the necessary debug APIs enabled.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `string` |

#### Returns

`Promise`\<`string` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.getTransactionResult`

***

### listAccounts()

> **listAccounts**(): `Promise`\<`JsonRpcSigner`[]\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:330](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L330)

#### Returns

`Promise`\<`JsonRpcSigner`[]\>

#### Inherited from

`JsonRpcApiProvider.listAccounts`

***

### listenerCount()

> **listenerCount**(`event?`): `Promise`\<`number`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:411](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L411)

Resolves to the number of listeners for %%event%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event?` | `ProviderEvent` |

#### Returns

`Promise`\<`number`\>

#### Inherited from

`JsonRpcApiProvider.listenerCount`

***

### listeners()

> **listeners**(`event?`): `Promise`\<`Listener`[]\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:412](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L412)

Resolves to the listeners for %%event%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event?` | `ProviderEvent` |

#### Returns

`Promise`\<`Listener`[]\>

#### Inherited from

`JsonRpcApiProvider.listeners`

***

### lookupAddress()

> **lookupAddress**(`address`, `coinType?`): `Promise`\<`string` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:373](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L373)

Resolves to the ENS name associated for the %%address%% or
 ``null`` if the //primary name// is not configured.

 Users must perform additional steps to configure a //primary name//,
 which is not currently common.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `address` | `string` |
| `coinType?` | `BigNumberish` |

#### Returns

`Promise`\<`string` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.lookupAddress`

***

### off()

> **off**(`event`, `listener?`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:413](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L413)

Unregister the %%listener%% for %%event%%. If %%listener%%
 is unspecified, all listeners are unregistered.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| `listener?` | `Listener` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.off`

***

### on()

> **on**(`event`, `listener`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:408](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L408)

Registers a %%listener%% that is called whenever the
 %%event%% occurs until unregistered.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| `listener` | `Listener` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.on`

***

### once()

> **once**(`event`, `listener`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:409](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L409)

Registers a %%listener%% that is called the next time
 %%event%% occurs.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| `listener` | `Listener` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.once`

***

### pause()

> **pause**(`dropWhilePaused?`): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:450](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L450)

Pause the provider. If %%dropWhilePaused%%, any events that occur
 while paused are dropped, otherwise all events will be emitted once
 the provider is unpaused.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `dropWhilePaused?` | `boolean` |

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider.pause`

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:414](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L414)

Unregister all listeners for %%event%%.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event?` | `ProviderEvent` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.removeAllListeners`

***

### removeListener()

> **removeListener**(`event`, `listener`): `Promise`\<`TevmProvider`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:416](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L416)

Alias for [[off]].

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `ProviderEvent` |
| `listener` | `Listener` |

#### Returns

`Promise`\<`TevmProvider`\>

#### Inherited from

`JsonRpcApiProvider.removeListener`

***

### request()

> **request**(`request`): `Promise`\<`any`\>

Defined in: [src/TevmProvider.js:210](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L210)

See [[link-eip-1193]] for details on this method.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | \{ `method`: `string`; `params?`: `any`[] \| `Record`\<`string`, `any`\>; \} |
| `request.method` | `string` |
| `request.params?` | `any`[] \| `Record`\<`string`, `any`\> |

#### Returns

`Promise`\<`any`\>

***

### resolveName()

> **resolveName**(`name`, `coinType?`): `Promise`\<`string` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:372](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L372)

Resolves to the address configured for the %%ensName%% or
 ``null`` if unconfigured.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `name` | `string` |
| `coinType?` | `BigNumberish` |

#### Returns

`Promise`\<`string` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.resolveName`

***

### resume()

> **resume**(): `void`

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:454](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L454)

Resume the provider.

#### Returns

`void`

#### Inherited from

`JsonRpcApiProvider.resume`

***

### send()

> **send**(`method`, `params`): `Promise`\<`any`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts:316](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/provider-jsonrpc.d.ts#L316)

Requests the %%method%% with %%params%% via the JSON-RPC protocol
 over the underlying channel. This can be used to call methods
 on the backend that do not have a high-level API within the Provider
 API.

 This method queues requests according to the batch constraints
 in the options, assigns the request a unique ID.

 **Do NOT override** this method in sub-classes; instead
 override [[_send]] or force the options values in the
 call to the constructor to modify this method's behavior.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `string` |
| `params` | `any`[] \| `Record`\<`string`, `any`\> |

#### Returns

`Promise`\<`any`\>

#### Inherited from

`JsonRpcApiProvider.send`

***

### waitForBlock()

> **waitForBlock**(`blockTag?`): `Promise`\<`Block`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:375](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L375)

Resolves to the block at %%blockTag%% once it has been mined.

 This can be useful for waiting some number of blocks by using
 the ``currentBlockNumber + N``.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `blockTag?` | `BlockTag` |

#### Returns

`Promise`\<`Block`\>

#### Inherited from

`JsonRpcApiProvider.waitForBlock`

***

### waitForTransaction()

> **waitForTransaction**(`hash`, `_confirms?`, `timeout?`): `Promise`\<`TransactionReceipt` \| `null`\>

Defined in: [node\_modules/.pnpm/ethers@6.17.0/node\_modules/ethers/lib.esm/providers/abstract-provider.d.ts:374](https://github.com/evmts/tevm-ethers/blob/main/../node_modules/.pnpm/ethers@6.17.0/node_modules/ethers/lib.esm/providers/abstract-provider.d.ts#L374)

Waits until the transaction %%hash%% is mined and has %%confirms%%
 confirmations.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `hash` | `string` |
| `_confirms?` | `number` \| `null` |
| `timeout?` | `number` \| `null` |

#### Returns

`Promise`\<`TransactionReceipt` \| `null`\>

#### Inherited from

`JsonRpcApiProvider.waitForTransaction`

***

### createMemoryProvider()

> `readonly` `static` **createMemoryProvider**(`options?`): `Promise`\<`TevmProvider`\>

Defined in: [src/TevmProvider.js:143](https://github.com/evmts/tevm-ethers/blob/main/TevmProvider.js#L143)

Creates a `TevmProvider` backed by a brand new in-memory Tevm node.

The node is created with `createTevmNode(options)` and extended with `tevmActions()` and
`tevmSend()`, so both the ethers provider API and the Tevm action API are available.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | `TevmNodeOptions`\<\{ `blockExplorers?`: \{\[`key`: `string`\]: `ChainBlockExplorer`; `default`: `ChainBlockExplorer`; \}; `blockTime?`: `number`; `contracts?`: \{\[`key`: `string`\]: `ChainContract` \| \{\[`sourceId`: `number`\]: `ChainContract` \| `undefined`; \} \| `undefined`; `ensRegistry?`: `ChainContract`; `ensUniversalResolver?`: `ChainContract`; `erc6492Verifier?`: `ChainContract`; `multicall3?`: `ChainContract`; \}; `copy`: () => `object`; `custom?`: `Record`\<`string`, `unknown`\>; `ensTlds?`: readonly `string`[]; `ethjsCommon`: `Common`; `experimental_preconfirmationTime?`: `number`; `extendSchema?`: `Record`\<`string`, `unknown`\>; `fees?`: `ChainFees`\<`ChainFormatters` \| `undefined`\>; `formatters?`: `ChainFormatters`; `id`: `number`; `name`: `string`; `nativeCurrency`: `ChainNativeCurrency`; `prepareTransactionRequest?`: `PrepareTransactionRequestFn` \| \[`fn`: `PrepareTransactionRequestFn`, `options`: `object`\]; `rpcUrls`: \{\[`key`: `string`\]: `ChainRpcUrls`; `default`: `ChainRpcUrls`; \}; `serializers?`: `ChainSerializers`\<`ChainFormatters` \| `undefined`, `TransactionSerializable`\>; `sourceId?`: `number`; `testnet?`: `boolean`; `verifyHash?`: `ChainVerifyHashFn`; \}\> | Tevm node options (fork config, mining config, chain common, logging). |

#### Returns

`Promise`\<`TevmProvider`\>

A provider whose backend is the newly created node.

#### Throws

If `options.fork.transport` is provided but the fork RPC cannot be reached while the node initializes.

#### Examples

```ts
import { TevmProvider } from '@tevm/ethers'

const provider = await TevmProvider.createMemoryProvider({ miningConfig: { type: 'auto' } })

console.log(await provider.getBlockNumber()) // 0
```

Forking mainnet:
```ts
import { TevmProvider } from '@tevm/ethers'
import { http } from 'viem'

const provider = await TevmProvider.createMemoryProvider({
  fork: { transport: http('https://mainnet.optimism.io')({}) },
})

console.log(await provider.getBalance('0x0000000000000000000000000000000000000001'))
```

#### See

[Tevm Node docs](https://node.tevm.sh)
