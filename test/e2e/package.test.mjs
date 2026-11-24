import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { ERC20 } from '@tevm/contract'
import * as esm from '@tevm/ethers'
import { PREFUNDED_PRIVATE_KEYS } from '@tevm/utils'
import { ContractFactory, Wallet } from 'ethers'

const require = createRequire(import.meta.url)
const recipient = '0x0000000000000000000000000000000000001234'

for (const [format, { Contract, Interface, TevmProvider }] of [
	['ESM', esm],
	['CommonJS', require('@tevm/ethers')],
]) {
	test(`${format} consumer deploys a contract and reads its state and logs`, async () => {
		const provider = await TevmProvider.createMemoryProvider({ miningConfig: { type: 'auto' } })
		try {
			const wallet = new Wallet(PREFUNDED_PRIVATE_KEYS[0], provider)
			const iface = new Interface(ERC20.abi)
			const factory = new ContractFactory(iface, ERC20.bytecode, wallet)
			const deployment = await factory.deploy('End-to-End Token', 'E2E')
			const deploymentReceipt = await deployment.deploymentTransaction().wait()
			assert.equal(deploymentReceipt.status, 1)
			const token = new Contract(await deployment.getAddress(), iface, wallet)
			assert.equal(await token.name(), 'End-to-End Token')
			assert.equal(await token.allowance(wallet.address, recipient), 0n)
			assert.equal(await token.approve.staticCall(recipient, 42n), true)

			const approval = await token.approve(recipient, 42n)
			const receipt = await approval.wait()
			assert.equal(receipt.status, 1)
			assert.equal(receipt.hash, approval.hash)
			assert.equal(await token.allowance(wallet.address, recipient), 42n)
			const [event] = await token.queryFilter(token.filters.Approval(wallet.address, recipient), receipt.blockNumber)
			assert.equal(event.transactionHash, approval.hash)
			assert.deepEqual(event.args.toArray(), [wallet.address, recipient, 42n])
		} finally {
			provider.destroy()
		}
	})
}
