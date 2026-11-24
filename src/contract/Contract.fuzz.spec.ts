import { AbiCoder, concat, getAddress, hexlify, id, type TransactionRequest } from 'ethers'
import fc from 'fast-check'
import { parseAbi } from 'viem'
import { describe, expect, it } from 'vitest'
import { Contract, Interface } from './Contract.js'

const address = '0x0000000000000000000000000000000000001234'
const signature = 'echo((address,int256,bytes)[],string)'
const abi = parseAbi([
	'function echo((address owner, int256 delta, bytes payload)[] rows, string label) view returns ((address owner, int256 delta, bytes payload)[] result, string text)',
	'event Updated(string indexed label, uint8 amount, bytes payload)',
	'error Rejected(int256 delta, bytes payload)',
])
const iface = new Interface(abi)
const coder = AbiCoder.defaultAbiCoder()
const echoTypes = ['tuple(address,int256,bytes)[]', 'string']
const selector = id(signature).slice(0, 10)
const signed256 = fc.bigInt({ min: -(2n ** 255n), max: 2n ** 255n - 1n })
const bytes = fc.uint8Array({ maxLength: 64 }).map((value) => hexlify(value) as `0x${string}`)
const account = fc
	.uint8Array({ minLength: 20, maxLength: 20 })
	.map((value) => getAddress(hexlify(value)) as `0x${string}`)
const label = fc.oneof(fc.string({ maxLength: 24 }), fc.constantFrom('', 'café', '東京', '🚀', 'a\u0000b'))
const rows = fc.array(fc.tuple(account, signed256, bytes), { maxLength: 6 })
const options = { seed: 20261124, numRuns: 150 }

describe('ABI adapter properties', () => {
	it('round-trips nested arguments through Interface and Contract runners', async () => {
		await fc.assert(
			fc.asyncProperty(rows, label, async (items, text) => {
				const encoded = coder.encode(echoTypes, [items, text])
				const calldata = concat([selector, encoded])
				expect(iface.encodeFunctionData('echo', [items, text])).toBe(calldata)
				expect(iface.decodeFunctionData('echo', calldata).toArray(true)).toEqual([items, text])

				const contract = new Contract(address, iface, {
					provider: null,
					async call(tx: TransactionRequest) {
						expect(tx).toMatchObject({ to: address, data: calldata, blockTag: 'latest' })
						return encoded
					},
				})
				const result = await contract.echo(items, text, { blockTag: 'latest' })
				expect(result.toArray(true)).toEqual([items, text])
			}),
			options,
		)
	})

	it('decodes indexed event hashes and typed custom errors', () => {
		fc.assert(
			fc.property(label, fc.integer({ min: 0, max: 255 }), bytes, signed256, (text, amount, payload, delta) => {
				const topics = [id('Updated(string,uint8,bytes)'), id(text)]
				const data = coder.encode(['uint8', 'bytes'], [amount, payload])
				const { args } = iface.parseLog({ topics, data }) ?? expect.unreachable('Expected an Updated log')
				expect(args[0].hash).toBe(topics[1])
				expect(args[1]).toBe(BigInt(amount))
				expect(args[2]).toBe(payload)

				const encodedError = iface.encodeErrorResult('Rejected', [delta, payload])
				expect(encodedError).toBe(
					concat([id('Rejected(int256,bytes)').slice(0, 10), coder.encode(['int256', 'bytes'], [delta, payload])]),
				)
				expect(iface.parseError(encodedError)?.args.toArray()).toEqual([delta, payload])
			}),
			options,
		)
	})
})
