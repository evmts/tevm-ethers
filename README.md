# @tevm/ethers

[![CI](https://github.com/evmts/tevm-ethers/actions/workflows/ci.yml/badge.svg)](https://github.com/evmts/tevm-ethers/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@tevm/ethers.svg)](https://www.npmjs.com/package/@tevm/ethers)

Ethers.js v6 integration for [Tevm](https://tevm.sh). This package provides:

- `TevmProvider`, an ethers `JsonRpcApiProvider` backed by an in-memory Tevm node or an existing Tevm client.
- Typed `Contract` and `Interface` exports that infer methods and events from a const ABI without code generation.

This repository was extracted from the Tevm monorepo so the integration can version and release on the cadence of ethers. Tevm's core packages remain independently published dependencies.

## Installation

```sh
pnpm add @tevm/ethers ethers tevm viem@2.46.0
```

`ethers`, `tevm`, and `viem` are peer dependencies, so applications choose the versions they use. The current published Tevm packages require viem 2.46.0 or earlier because they reference chain definitions removed in later viem releases.

## In-memory provider

```ts
import { TevmProvider } from '@tevm/ethers'

const provider = await TevmProvider.createMemoryProvider({
	miningConfig: { type: 'auto' },
})

const chainId = await provider.send('eth_chainId', [])
const blockNumber = await provider.getBlockNumber()

console.log({ chainId, blockNumber })
```

`TevmProvider` supports ordinary ethers provider APIs as well as Tevm JSON-RPC methods and exposes Tevm actions on `provider.tevm`.

## Typed contracts

```ts
import { Contract } from '@tevm/ethers'

const abi = [
	{
		type: 'function',
		name: 'balanceOf',
		stateMutability: 'view',
		inputs: [{ name: 'account', type: 'address' }],
		outputs: [{ name: 'balance', type: 'uint256' }],
	},
] as const

const token = new Contract('0x0000000000000000000000000000000000000000', abi, provider)
const balance = await token.balanceOf('0x0000000000000000000000000000000000000001')
```

## Development

This repository uses Node 24 and pnpm 9.

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

### Documentation site

The docs site lives in [`site/`](./site) and is built with [vocs](https://vocs.dev) 2.

```sh
pnpm docs:dev     # local dev server
pnpm docs:build   # static build to site/dist/public
pnpm docs:preview # preview the built site
```

It is published to [ethers.tevm.sh](https://ethers.tevm.sh). General Tevm documentation remains at [tevm.sh](https://tevm.sh), and the Tevm node docs at [node.tevm.sh](https://node.tevm.sh).

## License

[MIT](./LICENSE)
