import { defineConfig } from 'vocs/config'

export default defineConfig({
	title: '@tevm/ethers',
	titleTemplate: '%s · @tevm/ethers',
	description: 'Ethers.js v6 integration for Tevm: an in-memory TevmProvider and ABI-typed contracts.',
	baseUrl: process.env.VERCEL_ENV === 'production' ? 'https://ethers.tevm.sh' : process.env.VERCEL_URL,
	srcDir: 'src',
	renderStrategy: 'full-static',
	logoUrl: {
		light: '/tevm-logo-light.png',
		dark: '/tevm-logo-dark.png',
	},
	iconUrl: '/tevm-logo.webp',
	ogImageUrl: 'https://vocs.dev/api/og?logo=%logo&title=%title&description=%description',
	// vocs 2.x: `theme.accentColor` / `theme.colorScheme` from 1.x moved to the top level,
	// and the 1.x `font` option was removed.
	accentColor: 'light-dark(#0085FF, #4DA6FF)',
	colorScheme: 'light dark',
	editLink: {
		link: 'https://github.com/evmts/tevm-ethers/edit/main/site/src/pages/:path',
		text: 'Edit on GitHub',
	},
	socials: [{ icon: 'github', link: 'https://github.com/evmts/tevm-ethers' }],
	topNav: [
		{ text: 'Getting started', link: '/getting-started', match: '/getting-started' },
		{ text: 'Guides', link: '/guides/provider', match: '/guides' },
		{ text: 'API', link: '/api/tevm-provider', match: '/api' },
		{ text: 'Playground', link: '/playground', match: '/playground' },
		{
			text: 'Tevm docs',
			items: [
				{ text: 'Tevm', link: 'https://tevm.sh' },
				{ text: 'Contract', link: 'https://contract.tevm.sh' },
				{ text: 'Utils', link: 'https://utils.tevm.sh' },
				{ text: 'Logger', link: 'https://logger.tevm.sh' },
				{ text: 'Test', link: 'https://test.tevm.sh' },
				{ text: 'Ethers', link: 'https://ethers.tevm.sh' },
				{ text: 'Mud', link: 'https://mud.tevm.sh' },
				{ text: 'CLI', link: 'https://cli.tevm.sh' },
				{ text: 'Bundler', link: 'https://bundler.tevm.sh' },
				{ text: 'Examples', link: 'https://examples.tevm.sh' },
			],
		},
		{
			text: 'Ecosystem',
			items: [
				{ text: 'Tevm', link: 'https://tevm.sh' },
				{ text: 'Tevm Node', link: 'https://node.tevm.sh' },
				{ text: 'ethers.js v6', link: 'https://docs.ethers.org/v6/' },
				{ text: 'viem', link: 'https://viem.sh' },
			],
		},
	],
	sidebar: [
		{
			text: 'Introduction',
			items: [
				{ text: 'What is @tevm/ethers?', link: '/' },
				{ text: 'Getting started', link: '/getting-started' },
				{ text: 'Relationship to Tevm', link: '/ecosystem' },
				{ text: 'Playground', link: '/playground' },
			],
		},
		{
			text: 'Guides',
			items: [
				{ text: 'Using TevmProvider', link: '/guides/provider' },
				{ text: 'Forking a network', link: '/guides/forking' },
				{ text: 'Typed contracts', link: '/guides/typed-contracts' },
				{ text: 'Tevm actions & JSON-RPC', link: '/guides/tevm-actions' },
				{ text: 'Testing with Vitest', link: '/guides/testing' },
			],
		},
		{
			text: 'API reference',
			items: [
				{ text: 'TevmProvider', link: '/api/tevm-provider' },
				{ text: 'Contract & Interface', link: '/api/contract' },
				{ text: 'Types', link: '/api/types' },
			],
		},
	],
})
