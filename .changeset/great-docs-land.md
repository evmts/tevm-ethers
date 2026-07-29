---
"@tevm/ethers": patch
---

Fix and expand JSDoc across `TevmProvider`, `Contract`, `Interface`, and the contract types: the examples now use APIs that exist (`provider.tevm.contract` instead of the removed `script`, `createTevmNode(...).extend(...)` instead of the removed http client), include their imports, and document `@throws`.
