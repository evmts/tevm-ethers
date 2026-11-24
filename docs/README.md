**@tevm/ethers**

***

# @tevm/ethers

[![CI](https://github.com/evmts/tevm-ethers/actions/workflows/ci.yml/badge.svg)](https://github.com/evmts/tevm-ethers/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@tevm/ethers.svg)](https://www.npmjs.com/package/@tevm/ethers)

Ethers.js v6 integration for [Tevm](https://tevm.sh). This package provides:

- `TevmProvider`, an ethers `JsonRpcApiProvider` backed by an in-memory Tevm node or an existing Tevm client.
- Typed `Contract` and `Interface` exports that infer methods and events from a const ABI without code generation.

This repository was extracted from the Tevm monorepo so the integration can version and release on the cadence of ethers. Tevm's core packages remain independently published dependencies.

## Installation

```sh
pnpm add @tevm/ethers ethers tevm@1.0.0-next.149 viem@2.46.0
```

`ethers`, `tevm`, and `viem` are peer dependencies, so applications choose the versions they use. The current published Tevm packages require viem 2.46.0 or earlier because they reference chain definitions removed in later viem releases.

## In-memory provider

```ts
import { TevmProvider } from '@tevm/ethers'

const provider = await TevmProvider.createMemoryProvider({
	miningConfig: { type: 'auto' },
})

try {
	const chainId = await provider.request({ method: 'eth_chainId' })
	const blockNumber = await provider.getBlockNumber()
	console.log({ chainId, blockNumber })
} finally {
	provider.destroy()
}
```

`TevmProvider` supports ethers provider APIs and exposes Tevm actions on `provider.tevm`. Its `request({ method, params })` method also works with ethers `BrowserProvider` in Node.js tests.

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

const token = new Contract('0x0000000000000000000000000000000000001234', abi)
const request = await token.balanceOf.populateTransaction('0x0000000000000000000000000000000000000001')
console.log(request.data) // ABI-encoded balanceOf calldata
```

## Development

This repository uses Node 24 and pnpm 9.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test       # unit, integration, and ABI property tests
pnpm test:fuzz  # run the ABI properties on their own
pnpm test:e2e   # verify the ESM and CommonJS builds against an in-memory chain
pnpm bench      # measure provider and ABI adapter operations
```

The property tests use a fixed seed. On failure, fast-check prints the seed, shrink path, and minimized input. Benchmarks validate results while measuring throughput without machine-specific performance thresholds.

GitHub requires maintainer approval for checks on pull requests created by `GITHUB_TOKEN`, including the Changesets release PR. Approve the latest run from the PR checks before merging. The CI workflow also supports manual dispatch on the release branch if a pending run expires.

### Documentation site

The docs site lives in `site/` and is built with [vocs](https://vocs.dev) 2.

```sh
pnpm docs:dev     # local dev server
pnpm docs:build   # static build to site/dist/public
pnpm docs:preview # preview the built site
pnpm generate:docs # refresh the Markdown API reference in docs/
```

The Docs workflow builds and uploads the static site. Vercel's Git integration deploys `main` to [ethers.tevm.sh](https://ethers.tevm.sh). General Tevm documentation is at [tevm.sh](https://tevm.sh), and the Tevm node docs are at [node.tevm.sh](https://node.tevm.sh).

## License

[MIT](_media/LICENSE)
