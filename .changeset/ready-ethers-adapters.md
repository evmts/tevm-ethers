---
"@tevm/ethers": patch
---

Wait for Tevm node initialization before returning a memory provider. Expose a request API compatible with ethers `BrowserProvider`, preserve ethers `Interface` fragments while inferring contract types, and distinguish transaction responses from decoded static calls.
