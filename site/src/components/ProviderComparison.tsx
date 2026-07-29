'use client'

import { useEffect, useRef, useState } from 'react'

type Step = { label: string; ms: number }

const REMOTE_STEPS: Step[] = [
	{ label: 'serialize eth_call request', ms: 2 },
	{ label: 'open HTTPS connection', ms: 180 },
	{ label: 'round-trip to RPC endpoint', ms: 420 },
	{ label: 'wait for remote EVM execution', ms: 350 },
	{ label: 'decode JSON-RPC response', ms: 3 },
]

const TEVM_STEPS: Step[] = [
	{ label: 'serialize eth_call request', ms: 1 },
	{ label: 'execute in local Tevm EVM', ms: 4 },
	{ label: 'decode result', ms: 1 },
]

type LaneState = { step: number; done: boolean; elapsed: number }

const IDLE: LaneState = { step: -1, done: false, elapsed: 0 }

function Lane({ kind, title, steps, state }: { kind: string; title: string; steps: Step[]; state: LaneState }) {
	const total = steps.reduce((sum, s) => sum + s.ms, 0)
	return (
		<div className="tevm-provider-lane" data-kind={kind}>
			<div className="tevm-provider-lane-header">
				<span>{title}</span>
				<span>{state.done ? `${state.elapsed} ms` : '—'}</span>
			</div>
			<div className="tevm-provider-steps">
				{steps.map((s, i) => (
					<div
						key={s.label}
						className="tevm-provider-step"
						data-active={state.step === i}
						data-done={state.step > i || state.done}
					>
						<span className="tevm-provider-step-dot" />
						<span>{s.label}</span>
					</div>
				))}
			</div>
			<div className="tevm-provider-result" data-done={state.done}>
				<span>{state.done ? '0x0000…0de0b6b3a7640000' : 'waiting…'}</span>
				<span className="tevm-provider-latency">{state.done ? `${total} ms total` : ''}</span>
			</div>
		</div>
	)
}

export function ProviderComparison() {
	const [remote, setRemote] = useState<LaneState>(IDLE)
	const [tevm, setTevm] = useState<LaneState>(IDLE)
	const [running, setRunning] = useState(false)
	const timers = useRef<ReturnType<typeof setTimeout>[]>([])

	useEffect(() => () => timers.current.forEach(clearTimeout), [])

	const runLane = (steps: Step[], set: (s: LaneState) => void) => {
		let acc = 0
		steps.forEach((step, i) => {
			timers.current.push(setTimeout(() => set({ step: i, done: false, elapsed: 0 }), acc))
			acc += step.ms
		})
		timers.current.push(setTimeout(() => set({ step: steps.length, done: true, elapsed: acc }), acc))
	}

	const run = () => {
		if (running) return
		setRunning(true)
		setRemote(IDLE)
		setTevm(IDLE)
		runLane(REMOTE_STEPS, setRemote)
		runLane(TEVM_STEPS, setTevm)
		const total = REMOTE_STEPS.reduce((sum, s) => sum + s.ms, 0)
		timers.current.push(setTimeout(() => setRunning(false), total + 100))
	}

	return (
		<div className="tevm-provider-demo">
			<div className="tevm-playground-controls">
				<button type="button" className="tevm-button tevm-button--primary" onClick={run} disabled={running}>
					{running ? 'Calling balanceOf…' : 'Run balanceOf(0xVitalik)'}
				</button>
				<span style={{ fontSize: '0.8rem', color: 'var(--tevm-text-muted)' }}>
					The same ethers call, once through a remote RPC and once through TevmProvider's in-memory EVM.
				</span>
			</div>
			<div className="tevm-provider-lanes">
				<Lane kind="remote" title="JsonRpcProvider → remote RPC" steps={REMOTE_STEPS} state={remote} />
				<Lane kind="tevm" title="TevmProvider → local Tevm node" steps={TEVM_STEPS} state={tevm} />
			</div>
		</div>
	)
}
