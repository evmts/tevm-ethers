'use client'

import { useState } from 'react'

type Method = {
	name: string
	call: string
	result: string
}

const METHODS: Method[] = [
	{
		name: 'balanceOf',
		call: 'const balance = await token.balanceOf(\n  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"\n)',
		result: 'balance: bigint\n// 420691337000000000000n — inferred from\n// outputs: [{ type: "uint256" }]',
	},
	{
		name: 'transfer',
		call: 'const tx = await token.transfer(\n  "0x000000000000000000000000000000000000dEaD",\n  parseEther("1")\n)',
		result:
			'tx: ContractTransactionResponse\n// write methods stay full ethers transactions;\n// only the arguments are typed',
	},
	{
		name: 'allowance',
		call: 'const allowance = await token.allowance(\n  owner,\n  spender\n)',
		result:
			'allowance: bigint\n// two address args required — passing one\n// is a compile error, not a runtime revert',
	},
	{
		name: 'symbol',
		call: 'const ticker = await token.symbol()',
		result: 'ticker: string\n// inferred from outputs: [{ type: "string" }]\n// no .toString(), no any, no codegen',
	},
]

export function TypedContractDemo() {
	const [active, setActive] = useState(0)
	const method = METHODS[active] as Method

	return (
		<div className="tevm-typed-demo">
			<div className="tevm-typed-methods">
				{METHODS.map((m, i) => (
					<button
						key={m.name}
						type="button"
						className="tevm-typed-method"
						data-active={i === active}
						onClick={() => setActive(i)}
					>
						{m.name}
					</button>
				))}
			</div>
			<div className="tevm-typed-panels">
				<div className="tevm-typed-panel">
					<div className="tevm-typed-panel-title">you write</div>
					<div className="tevm-typed-panel-body">
						<span className="tevm-typed-kw">{method.call.slice(0, method.call.indexOf(' '))}</span>
						{method.call.slice(method.call.indexOf(' '))}
					</div>
				</div>
				<div className="tevm-typed-panel">
					<div className="tevm-typed-panel-title">typescript infers</div>
					<div className="tevm-typed-panel-body">
						{method.result.split('\n').map((line) =>
							line.startsWith('//') ? (
								<div key={line} className="tevm-typed-comment">
									{line}
								</div>
							) : (
								<div key={line}>{line}</div>
							),
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
