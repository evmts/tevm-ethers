import { ERC20 } from '@tevm/contract'
import { type ContractTransactionResponse, type ethers, FunctionFragment, type Result } from 'ethers'
import { assertType, describe, expect, expectTypeOf, test } from 'vitest'
import { TevmProvider } from '../TevmProvider.js'
import { Contract, Interface } from './Contract.js'

const abi = [
	{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'spender',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Approval',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [{ indexed: true, internalType: 'address', name: 'usr', type: 'address' }],
		name: 'Deny',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [{ indexed: true, internalType: 'address', name: 'usr', type: 'address' }],
		name: 'Rely',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'from', type: 'address' },
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{
				indexed: false,
				internalType: 'uint256',
				name: 'value',
				type: 'uint256',
			},
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		inputs: [],
		name: 'DOMAIN_SEPARATOR',
		outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'PERMIT_TYPEHASH',
		outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: '', type: 'address' },
			{ internalType: 'address', name: '', type: 'address' },
		],
		name: 'allowance',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'approve',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'from', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'burn',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
		],
		name: 'decreaseAllowance',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'usr', type: 'address' }],
		name: 'deny',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'deploymentChainId',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'addedValue', type: 'uint256' },
		],
		name: 'increaseAllowance',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'mint',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'name',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'nonces',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'address', name: 'spender', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
			{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
			{ internalType: 'uint8', name: 'v', type: 'uint8' },
			{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
			{ internalType: 'bytes32', name: 's', type: 'bytes32' },
		],
		name: 'permit',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: 'usr', type: 'address' }],
		name: 'rely',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalSupply',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'from', type: 'address' },
			{ internalType: 'address', name: 'to', type: 'address' },
			{ internalType: 'uint256', name: 'value', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'version',
		outputs: [{ internalType: 'string', name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'wards',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

const addresses = { 10: `0x${'da'.repeat(20)}` } as const

const createErc20Contract = async () => {
	const provider = await TevmProvider.createMemoryProvider({})
	const deployResult = await provider.tevm.deploy({ ...ERC20.deploy('Dai Stablecoin', 'DAI'), addToBlockchain: true })
	if (!deployResult.createdAddress) {
		throw new Error('contract never deployed')
	}
	return { contract: new Contract(deployResult.createdAddress, abi, provider), provider }
}

describe('ethers.Contract', () => {
	test('Should be typesafe with return types', () => {
		const c = new Contract(addresses[10], abi, null)

		assertType<ethers.Contract>(c)

		expectTypeOf<Awaited<ReturnType<typeof c.name>>>().toBeString()
		expectTypeOf<Awaited<ReturnType<typeof c.symbol>>>().toBeString()
		expectTypeOf<Awaited<ReturnType<typeof c.decimals>>>().toEqualTypeOf<bigint>()
		expectTypeOf<Awaited<ReturnType<typeof c.totalSupply>>>().toEqualTypeOf<bigint>()
		expectTypeOf<Awaited<ReturnType<typeof c.transfer>>>().toEqualTypeOf<ContractTransactionResponse>()
		expectTypeOf<Awaited<ReturnType<typeof c.transfer.staticCall>>>().toEqualTypeOf<boolean>()
		expectTypeOf<Awaited<ReturnType<typeof c.mint.staticCall>>>().toEqualTypeOf<Result & readonly []>()
	})

	test('infers a contract ABI from an interface without replacing ethers fragments', () => {
		const iface = new Interface(abi)
		assertType<ethers.Interface>(iface)
		const contract = new Contract(addresses[10], iface)
		expectTypeOf<Awaited<ReturnType<typeof contract.decimals>>>().toEqualTypeOf<bigint>()
		expect(iface.getFunction('decimals')).toBeInstanceOf(FunctionFragment)
		expect(iface.getFunction('decimals')?.format()).toBe('decimals()')
	})

	test('Should be typesafe with arguments', async () => {
		const c = new Contract(addresses[10], abi, null)

		assertType<Parameters<typeof c.totalSupply>>([])
		assertType<Parameters<typeof c.totalSupply>>([{ blockTag: 132873940, chainId: 25 }])
		assertType<Parameters<typeof c.balanceOf>>([addresses[10]])
		assertType<Parameters<typeof c.balanceOf>>([addresses[10], { blockTag: 132873940, chainId: 25 }])
		assertType<Parameters<typeof c.mint>>(['0x2342', 234234n])
		assertType<Parameters<typeof c.mint>>([
			'0x234234',
			234234n,
			{
				blockTag: 132873940,
				chainId: 25,
				gasLimit: BigInt(420),
				value: BigInt(420),
			},
		])

		// Types should throw
		// @ts-expect-error
		assertType<Parameters<typeof c.totalSupply>>(['0x234234'])
		// @ts-expect-error
		assertType<Parameters<typeof c.mint>>(['should be an address', BigInt(420)])
	})

	test('should work', async () => {
		const { contract, provider } = await createErc20Contract()
		try {
			expect(contract).toBeInstanceOf(Contract)
			expect(await contract.name()).toBe('Dai Stablecoin')
			expect(await contract.symbol()).toBe('DAI')
			expect(await contract.decimals()).toBe(18n)
			expect(await contract.totalSupply()).toBe(0n)
			expect(await contract.balanceOf('0x32307adfFE088e383AFAa721b06436aDaBA47DBE')).toBe(0n)
		} finally {
			provider.destroy()
		}
	})
})
