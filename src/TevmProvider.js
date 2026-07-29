import { tevmActions, tevmSend } from '@tevm/decorators'
import { createTevmNode } from '@tevm/node'
import { JsonRpcApiProvider } from 'ethers'

/**
 * An [ethers JsonRpcApiProvider](https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcApiProvider) backed by a Tevm node.
 *
 * ## TevmProvider
 *
 * `TevmProvider` is a normal ethers v6 provider whose JSON-RPC backend is an in-process Tevm EVM
 * instead of a remote node. No server, no socket, no `anvil`. Use {@link TevmProvider.createMemoryProvider}
 * to create a provider with a fresh in-memory node, or pass an existing Tevm node to the constructor.
 *
 * @example
 * ```typescript
 * import { TevmProvider } from '@tevm/ethers'
 *
 * const provider = await TevmProvider.createMemoryProvider({
 *   miningConfig: { type: 'auto' },
 * })
 *
 * console.log(await provider.send('eth_chainId', [])) // '0x384'
 * console.log(await provider.getBlockNumber()) // 0
 * ```
 *
 * ## Forking a live network
 *
 * @example
 * ```typescript
 * import { TevmProvider } from '@tevm/ethers'
 * import { http } from 'viem'
 *
 * const provider = await TevmProvider.createMemoryProvider({
 *   fork: { transport: http('https://mainnet.optimism.io')({}) },
 * })
 *
 * const blockNumber = await provider.getBlockNumber()
 * console.log(blockNumber) // the forked block height
 * ```
 *
 * ## Using an existing Tevm node
 *
 * The constructor accepts any Tevm node extended with `tevmActions()` and `tevmSend()`, which lets
 * several providers (or a viem client and an ethers provider) share one EVM instance.
 *
 * @example
 * ```typescript
 * import { TevmProvider } from '@tevm/ethers'
 * import { tevmActions, tevmSend } from '@tevm/decorators'
 * import { createTevmNode } from '@tevm/node'
 *
 * const node = createTevmNode().extend(tevmActions()).extend(tevmSend())
 *
 * const provider = new TevmProvider(node)
 * console.log(await provider.getBlockNumber()) // 0
 * ```
 *
 * ## Tevm actions support
 *
 * The Tevm action API is available on the {@link TevmProvider#tevm} property.
 *
 * @example
 * ```typescript
 * import { TevmProvider } from '@tevm/ethers'
 * import { createContract } from '@tevm/contract'
 *
 * const provider = await TevmProvider.createMemoryProvider({})
 *
 * const addContract = createContract({
 *   name: 'AddContract',
 *   humanReadableAbi: ['function add(uint256 a, uint256 b) public pure returns (uint256)'],
 *   address: `0x${'42'.repeat(20)}`,
 *   deployedBytecode:
 *     '0x608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063771602f71461002d575b5f80fd5b610047600480360381019061004291906100a9565b61005d565b60405161005491906100f6565b60405180910390f35b5f818361006a919061013c565b905092915050565b5f80fd5b5f819050919050565b61008881610076565b8114610092575f80fd5b50565b5f813590506100a38161007f565b92915050565b5f80604083850312156100bf576100be610072565b5b5f6100cc85828601610095565b92505060206100dd85828601610095565b9150509250929050565b6100f081610076565b82525050565b5f6020820190506101095f8301846100e7565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61014682610076565b915061015183610076565b92508282019050808211156101695761016861010f565b5b9291505056fea2646970667358221220a8f4b7187c62760aefc097c1827799c61a6df322acc9d7575862a525f9aa59a364736f6c63430008170033',
 * })
 *
 * await provider.tevm.setAccount({
 *   address: addContract.address,
 *   deployedBytecode: addContract.deployedBytecode,
 * })
 *
 * const result = await provider.tevm.contract(addContract.read.add(390n, 30n))
 * console.log(result.data) // 420n
 * ```
 *
 * ## Tevm JSON-RPC support
 *
 * `provider.send` accepts the Tevm JSON-RPC methods (`tevm_setAccount`, `tevm_getAccount`,
 * `tevm_call`, `tevm_mine`, `tevm_dumpState`, `tevm_loadState`) in addition to the standard
 * `eth_*` methods.
 *
 * @example
 * ```typescript
 * import { TevmProvider } from '@tevm/ethers'
 * import { toHex } from '@tevm/utils'
 *
 * const provider = await TevmProvider.createMemoryProvider({})
 *
 * await provider.send('tevm_setAccount', [
 *   { address: `0x${'69'.repeat(20)}`, nonce: toHex(1n), balance: toHex(420n) },
 * ])
 *
 * const account = await provider.send('tevm_getAccount', [{ address: `0x${'69'.repeat(20)}` }])
 * console.log(account.balance) // '0x1a4'
 * ```
 *
 * @see {@link https://node.tevm.sh | Tevm Node docs}
 * @see {@link https://docs.ethers.org/v6/ | ethers v6 docs}
 */
export class TevmProvider extends JsonRpcApiProvider {
	/**
	 * Creates a `TevmProvider` backed by a brand new in-memory Tevm node.
	 *
	 * The node is created with `createTevmNode(options)` and extended with `tevmActions()` and
	 * `tevmSend()`, so both the ethers provider API and the Tevm action API are available.
	 *
	 * @param {import('@tevm/node').TevmNodeOptions} [options] - Tevm node options (fork config, mining config, chain common, logging).
	 * @returns {Promise<TevmProvider>} A provider whose backend is the newly created node.
	 * @throws {Error} If `options.fork.transport` is provided but the fork RPC cannot be reached while the node initializes.
	 * @readonly
	 * @example
	 * ```ts
	 * import { TevmProvider } from '@tevm/ethers'
	 *
	 * const provider = await TevmProvider.createMemoryProvider({ miningConfig: { type: 'auto' } })
	 *
	 * console.log(await provider.getBlockNumber()) // 0
	 * ```
	 * @example
	 * Forking mainnet:
	 * ```ts
	 * import { TevmProvider } from '@tevm/ethers'
	 * import { http } from 'viem'
	 *
	 * const provider = await TevmProvider.createMemoryProvider({
	 *   fork: { transport: http('https://mainnet.optimism.io')({}) },
	 * })
	 *
	 * console.log(await provider.getBalance('0x0000000000000000000000000000000000000001'))
	 * ```
	 * @see {@link https://node.tevm.sh | Tevm Node docs}
	 */
	static createMemoryProvider = async (options) => {
		return new TevmProvider(createTevmNode(options).extend(tevmActions()).extend(tevmSend()))
	}

	/**
	 * The Tevm action + JSON-RPC API of the underlying node.
	 *
	 * Every Tevm action handler is available here: `call`, `contract`, `deploy`, `deal`, `mine`,
	 * `getAccount`, `setAccount`, `dumpState`, `loadState`, plus `send`/`sendBulk` for raw JSON-RPC.
	 *
	 * @type {import('@tevm/decorators').TevmSendApi & import('@tevm/decorators').TevmActionsApi}
	 * @example
	 * ```typescript
	 * import { TevmProvider } from '@tevm/ethers'
	 *
	 * const provider = await TevmProvider.createMemoryProvider({})
	 *
	 * await provider.tevm.setAccount({ address: `0x${'69'.repeat(20)}`, balance: 420n })
	 *
	 * const account = await provider.tevm.getAccount({ address: `0x${'69'.repeat(20)}` })
	 * console.log(account.balance) // 420n
	 * ```
	 * @see {@link https://node.tevm.sh/api/actions | Tevm actions reference}
	 */
	tevm

	/**
	 * Wraps an existing Tevm node (or any object exposing one on a `tevm` property) in an ethers provider.
	 *
	 * Batching and response caching are disabled because the backend is in-process: requests are
	 * already effectively free and caching would hide state mutations made through `provider.tevm`.
	 *
	 * @param {(import('@tevm/decorators').TevmSendApi & import('@tevm/decorators').TevmActionsApi) | {tevm: import('@tevm/decorators').TevmSendApi & import('@tevm/decorators').TevmActionsApi}} client A Tevm node extended with `tevmSend()` and `tevmActions()`, or a client exposing one as `.tevm`.
	 * @throws {TypeError} If `client` neither implements `send`/`sendBulk` nor exposes a node on a `tevm` property.
	 * @example
	 * ```ts
	 * import { TevmProvider } from '@tevm/ethers'
	 * import { tevmActions, tevmSend } from '@tevm/decorators'
	 * import { createTevmNode } from '@tevm/node'
	 *
	 * const node = createTevmNode().extend(tevmActions()).extend(tevmSend())
	 *
	 * const provider = new TevmProvider(node)
	 * console.log(await provider.getBlockNumber()) // 0
	 * ```
	 */
	constructor(client) {
		super(undefined, {
			staticNetwork: true,
			batchMaxCount: 1,
			batchStallTime: 0,
			cacheTimeout: -1,
		})
		this.tevm = 'tevm' in client ? client.tevm : client
		this._start()
	}

	/**
	 * Sends a JSON-RPC payload (or a batch) to the underlying Tevm node.
	 *
	 * Called by ethers internals; prefer `provider.send(method, params)` in application code.
	 *
	 * @type {import('ethers').JsonRpcApiProvider['_send']}
	 * @throws {Error} If the underlying node rejects the request (transport-level failure). Method-level
	 * failures are returned as JSON-RPC error objects rather than thrown.
	 * @example
	 * ```ts
	 * import { TevmProvider } from '@tevm/ethers'
	 *
	 * const provider = await TevmProvider.createMemoryProvider({})
	 *
	 * // `send` is the public API; it delegates to `_send` under the hood
	 * console.log(await provider.send('eth_chainId', [])) // '0x384'
	 * ```
	 */
	_send = async (payload) => {
		if (Array.isArray(payload)) {
			return /** @type {Promise<Array<import('ethers').JsonRpcResult | import('ethers').JsonRpcError>>}*/ (
				this.tevm.sendBulk(
					/** @type {Array<import('@tevm/actions').TevmJsonRpcRequest | import('@tevm/actions').EthJsonRpcRequest>}*/ (
						payload
					),
				)
			)
		}
		return /** @type {[import('ethers').JsonRpcResult | import('ethers').JsonRpcError]}*/ ([
			await this.tevm.send(
				/** @type {import('@tevm/actions').TevmJsonRpcRequest | import('@tevm/actions').EthJsonRpcRequest}*/ (payload),
			),
		])
	}
}
