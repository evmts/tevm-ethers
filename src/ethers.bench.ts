import { afterAll, beforeAll, bench, describe } from 'vitest'
import { Contract, Interface, TevmProvider } from './index.js'

const options = { time: 250, warmupTime: 60, warmupIterations: 5, throws: true }
const address = '0x0000000000000000000000000000000000006001'
const answer = `0x${'0'.repeat(62)}2a`
const iface = new Interface(['function answer() view returns (uint256)'])
let provider: TevmProvider
let contract: InstanceType<typeof Contract>

beforeAll(async () => {
	provider = await TevmProvider.createMemoryProvider()
	await provider.tevm.setAccount({ address, balance: 42n, deployedBytecode: '0x602a60005260206000f3' })
	contract = new Contract(address, iface, provider)
})

afterAll(() => provider?.destroy())

describe('TevmProvider', () => {
	bench(
		'getBlockNumber',
		async () => {
			if ((await provider.getBlockNumber()) !== 0) throw new Error('Expected the genesis block')
		},
		options,
	)
	bench(
		'getBalance',
		async () => {
			if ((await provider.getBalance(address)) !== 42n) throw new Error('Unexpected balance')
		},
		options,
	)
	bench(
		'call',
		async () => {
			if ((await provider.call({ to: address })) !== answer) throw new Error('Unexpected EVM result')
		},
		options,
	)
	bench(
		'send eth_chainId',
		async () => {
			if ((await provider.send('eth_chainId', [])) !== '0x384') throw new Error('Unexpected chain ID')
		},
		options,
	)
})

describe('ethers adapters', () => {
	bench(
		'Interface decodeFunctionResult',
		() => {
			if (iface.decodeFunctionResult('answer', answer)[0] !== 42n) throw new Error('Unexpected ABI result')
		},
		options,
	)
	bench(
		'Contract read',
		async () => {
			if ((await contract.getFunction('answer')()) !== 42n) throw new Error('Unexpected contract result')
		},
		options,
	)
})
