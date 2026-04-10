# VaultToken (VTK)

ERC-20 token deployed on Ethereum Sepolia testnet with a full CI/CD pipeline using GitHub Actions.

**Live Contract:** [`0x1782818A016cec7cC738fD4759C8F813cd004Fa6`](https://sepolia.etherscan.io/address/0x1782818A016cec7cC738fD4759C8F813cd004Fa6)

![CI/CD](https://github.com/aristematic/vaulttoken/actions/workflows/ci-cd.yml/badge.svg)

---

## Stack

| Layer | Tool |
|-------|------|
| Smart contract | Solidity 0.8.24 + OpenZeppelin 5 |
| Dev framework | Hardhat v2 |
| Testing | Mocha + Chai + Hardhat Network Helpers |
| CI/CD | GitHub Actions |
| Network | Ethereum Sepolia testnet |
| Explorer | Etherscan |

---

## Token Details

| Property | Value |
|----------|-------|
| Name | VaultToken |
| Symbol | VTK |
| Decimals | 18 |
| Max Supply | 1,000,000 VTK |
| Initial Supply | 100,000 VTK |
| Features | Mintable, Burnable, Ownable |

---

## Project Structure

```
vaulttoken/
├── contracts/
│   └── VaultToken.sol            # ERC-20 contract
├── test/
│   └── VaultToken.test.js        # 14 unit tests
├── scripts/
│   └── deploy.js                 # Deploy + Etherscan verify script
├── deployments/
│   └── sepolia.json              # Auto-generated deployment info
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions pipeline
├── hardhat.config.js
├── .env.example
└── package.json
```

---

## CI/CD Pipeline

Every push to `main` automatically runs:

```
Push to main
     │
     ▼
[1] Compile contracts
     │
     ▼
[2] Run 14 unit tests
     │
     ▼
[3] Deploy to Sepolia
```

Pull requests only trigger compile + test — no deploy.

---

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/aristematic/vaulttoken
cd vaulttoken
npm install

# 2. Setup environment
cp .env.example .env
# Fill in SEPOLIA_RPC_URL and PRIVATE_KEY

# 3. Compile
npx hardhat compile

# 4. Run tests
npx hardhat test

# 5. Deploy locally
npx hardhat node          # Terminal 1 — start local chain
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2

# 6. Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

---

## GitHub Secrets Required

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Where to get it |
|--------|----------------|
| `SEPOLIA_RPC_URL` | [alchemy.com](https://alchemy.com) → Create app → Sepolia → HTTPS URL |
| `PRIVATE_KEY` | MetaMask → Account Details → Export Private Key |

> ⚠️ Never commit your `.env` file or real private key to git.

---

## Contract Features

- **Mint** — owner can mint tokens up to MAX_SUPPLY of 1,000,000 VTK
- **Burn** — any holder can burn their own tokens
- **Transfer** — standard ERC-20 transfers and approvals
- **remainingSupply()** — view how many tokens can still be minted
- **Custom errors** — gas-efficient reverts with `ZeroAddress`, `ZeroAmount`, `ExceedsMaxSupply`

---

## Test Coverage

```
VaultToken
  Deployment
    ✔ should set correct name and symbol
    ✔ should mint initial supply to owner
    ✔ should set correct MAX_SUPPLY
    ✔ should revert if deployed with zero address
  Minting
    ✔ should allow owner to mint tokens
    ✔ should emit TokensMinted event
    ✔ should revert if non-owner tries to mint
    ✔ should revert mint beyond MAX_SUPPLY
    ✔ should revert mint to zero address
    ✔ should revert mint of zero amount
  Transfers
    ✔ should transfer tokens between accounts
    ✔ should revert transfer if insufficient balance
  Burning
    ✔ should allow holder to burn tokens
  remainingSupply()
    ✔ should return correct remaining supply

14 passing
```