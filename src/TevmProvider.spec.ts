import { createContract, ERC20 } from '@tevm/contract'
import { encodeDeployData, toHex } from '@tevm/utils'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { Interface } from './contract/index.js'
import { TevmProvider } from './TevmProvider.js'

describe(TevmProvider.name, () => {
	let provider: TevmProvider

	beforeEach(async () => {
		provider = await TevmProvider.createMemoryProvider({})
	})
	afterEach(() => provider?.destroy())

	it('should be able to use like a normal JsonRpcProvider', async () => {
		expect(await provider.send('eth_chainId', [])).toBe('0x384')
	})

	it('accepts EIP-1193 requests and works with BrowserProvider', async () => {
		expectTypeOf(provider).toExtend<Eip1193Provider>()
		expect(await provider.request({ method: 'eth_chainId' })).toBe('0x384')
		const browser = new BrowserProvider(provider)
		try {
			expect((await browser.getNetwork()).chainId).toBe(900n)
		} finally {
			browser.destroy()
		}
	})

	it('preserves results, error codes and request IDs in a JSON-RPC batch', async () => {
		const responses = await provider._send([
			{ jsonrpc: '2.0', id: 31, method: 'eth_chainId', params: [] },
			{ jsonrpc: '2.0', id: 42, method: 'missing', params: [] },
		])
		expect(responses).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ jsonrpc: '2.0', id: 31, result: '0x384' }),
				expect.objectContaining({ id: 42, error: expect.objectContaining({ code: -32601 }) }),
			]),
		)
		await expect(provider.request({ method: 'missing' })).rejects.toMatchObject({ error: { code: -32601 } })
	})

	it('rejects clients without the Tevm JSON-RPC transport', () => {
		expect(() => new TevmProvider({ tevm: {} } as never)).toThrow(TypeError)
	})

	describe('should be able to do tevm specific requests', () => {
		it('provider.send', async () => {
			expect(
				await provider.send('tevm_setAccount', [
					{
						address: `0x${'69'.repeat(20)}`,
						nonce: toHex(1n),
						balance: toHex(420n),
					},
				]),
			).toMatchObject({})
			expect(
				await provider.send('tevm_getAccount', [
					{
						address: `0x${'69'.repeat(20)}`,
					},
				]),
			).toMatchObject({
				address: '0x6969696969696969696969696969696969696969',
				balance: toHex(420n),
				deployedBytecode: '0x',
				nonce: toHex(1n),
				storageRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
				storage: undefined,
				codeHash: '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
				isContract: false,
				isEmpty: false,
			})
		}, 15_000)

		it('runs a contract against supplied bytecode', async () => {
			const result = await provider.tevm.contract(
				ERC20.withCode(encodeDeployData(ERC20.deploy('name', 'SYMBOL'))).read.balanceOf(`0x${'69'.repeat(20)}`),
			)
			expect(result).toMatchObject({
				executionGasUsed: 2851n,
				totalGasSpent: 24283n,
				createdAddresses: new Set(),
				data: 0n,
				logs: [],
				rawData: '0x0000000000000000000000000000000000000000000000000000000000000000',
				selfdestruct: new Set(),
			})
		}, 15_000)

		it('provider.tevm.setAccount', async () => {
			const result = await provider.tevm.setAccount({
				address: `0x${'69'.repeat(20)}`,
				balance: 420n,
			})
			if ('errors' in result || result.errors) {
				throw new Error('should not have errors')
			}
			expect(result).toMatchObject({})
		}, 15_000)

		it('provider.tevm.call', async () => {
			const daiContract = createContract({
				name: 'Dai',
				humanReadableAbi: ['function balanceOf(address account) public view returns (uint256)'],
			} as const)
			const iface = new Interface(daiContract.abi)
			const data = iface.encodeFunctionData('balanceOf', [`0x${'69'.repeat(20)}`]) as `0x${string}`
			const result = await provider.tevm.call({
				deployedBytecode: ERC20.deployedBytecode,
				data,
				caller: `0x${'69'.repeat(20)}`,
			})
			expect(result).toMatchObject({
				createdAddresses: new Set(),
				logs: [],
				rawData: '0x0000000000000000000000000000000000000000000000000000000000000000',
				selfdestruct: new Set(),
			})
			expect(result.executionGasUsed).toBeGreaterThan(0n)
			expect(result.totalGasSpent).toBeGreaterThan(0n)
		}, 15_000)

		it('provider.tevm.contract', async () => {
			const result = await provider.tevm.contract(
				ERC20.withCode(encodeDeployData(ERC20.deploy('name', 'SYMBOL'))).read.balanceOf(`0x${'69'.repeat(20)}`),
			)
			expect(result).toMatchObject({
				createdAddresses: new Set(),
				data: 0n,
				logs: [],
				rawData: '0x0000000000000000000000000000000000000000000000000000000000000000',
				selfdestruct: new Set(),
			})
			expect(result.executionGasUsed).toBeGreaterThan(0n)
			expect(result.totalGasSpent).toBeGreaterThan(0n)
		}, 15_000)
	})
})
