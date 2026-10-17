# PortalYield — RWA Yield Protocol on Portaldot Network V3.0

> **Track**: Ecosystem DApps | **Hackathon**: Portaldot Network Hacker House

PortalYield is a decentralized protocol that tokenizes Real World Assets (RWAs) as ERC-721 NFTs and fractionalize their yield streams into ERC-20 tokens (PYT), all deployed natively on **Portaldot Network V3.0**'s EVM-compatible layer.

---

## 🌐 Live Demo

- **DApp**: [https://portalyield.vercel.app](https://portalyield.vercel.app) *(coming soon)*
- **Portaldot Testnet Explorer**: See contract addresses below

---

## 📄 Testnet Deployment (Portaldot EVM Testnet)

| Contract | Address | Tx Hash |
|---|---|---|
| RWAAsset (ERC-721) | `TBD` | `TBD` |
| YieldToken PYT (ERC-20) | `TBD` | `TBD` |
| PortalYieldVault | `TBD` | `TBD` |
| CrossChainBridge | `TBD` | `TBD` |

> Addresses will be updated after Portaldot testnet RPC is confirmed live.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PortalYield Protocol                │
│                                                     │
│  ┌─────────────┐    stake     ┌──────────────────┐  │
│  │  RWAAsset   │ ──────────▶  │ PortalYieldVault │  │
│  │  (ERC-721)  │              │                  │  │
│  │             │ ◀──────────  │  mint/burn PYT   │  │
│  │ T-Bills     │   unstake    └──────────────────┘  │
│  │ Corp Bonds  │                      │              │
│  │ Real Estate │               mint yield PYT       │
│  └─────────────┘                      ▼              │
│                              ┌──────────────────┐   │
│                              │  YieldToken PYT  │   │
│                              │    (ERC-20)      │   │
│                              └──────────────────┘   │
│                                      │              │
│                              ┌───────▼──────────┐   │
│                              │ CrossChainBridge │   │
│                              │ Portaldot ↔ ETH  │   │
│                              └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### How It Works

1. **Tokenize RWA** — Whitelisted issuers mint ERC-721 NFTs representing real-world assets (T-Bills, bonds, real estate) with on-chain metadata: face value, yield rate, maturity date.

2. **Stake NFT → Earn PYT** — Users deposit RWA NFTs into the `PortalYieldVault`. They receive `PYT` (PortalYield Token, ERC-20) proportional to the NFT's face value:
   - 1 USD cent of face value = 1 PYT (10¹⁶ wei)
   - Example: $1,000 T-Bill → 1,000 PYT

3. **Claim Yield** — As time passes, users accumulate yield in PYT based on the asset's annual yield rate. Claimable anytime.

4. **Unstake** — Return NFT, burn principal PYT, claim any remaining yield.

5. **Cross-Chain Bridge** — PYT tokens can be bridged to other EVM chains via the `CrossChainBridge`, leveraging Portaldot's multi-chain infrastructure.

---

## 🔗 Portaldot V3.0 Integration

| Feature | How PortalYield Uses It |
|---|---|
| **EVM Compatibility** | All contracts are Solidity, deployed on Portaldot's EVM layer |
| **ERC-20 Support** | PYT yield token — tradeable, bridgeable |
| **ERC-721 Support** | RWA NFTs with rich on-chain metadata |
| **Multi-Chain** | CrossChainBridge leverages Portaldot's cross-chain messaging |
| **Modular Architecture** | Vault, token, bridge are independent composable modules |

---

## 📁 Project Structure

```
portaldot_hack/
├── contracts/
│   ├── RWAAsset.sol          # ERC-721: Real World Asset NFTs
│   ├── YieldToken.sol        # ERC-20: PYT yield token
│   ├── PortalYieldVault.sol  # Core vault: stake, earn, withdraw
│   └── CrossChainBridge.sol  # Cross-chain PYT bridge
├── scripts/
│   └── deploy.js             # Deployment script
├── test/
│   └── PortalYield.test.js   # 15 comprehensive tests (all passing)
├── frontend/                 # Next.js DApp
├── docs/                     # Architecture & pitch deck
├── hardhat.config.js
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Install

```bash
git clone https://github.com/YOUR_USERNAME/portaldot_hack.git
cd portaldot_hack
npm install
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

Expected output:
```
  PortalYield Protocol
    RWAAsset (ERC-721)
      ✔ should mint an RWA NFT successfully
      ✔ should reject minting with past maturity date
      ✔ should reject minting by non-whitelisted address
      ✔ should calculate accrued yield after 30 days
    YieldToken (ERC-20 PYT)
      ✔ should have correct name, symbol and decimals
      ✔ should only allow vault to mint
    PortalYieldVault
      ✔ should stake NFT and mint PYT tokens
      ✔ should accrue yield over 180 days
      ✔ should allow yield claim and increase PYT balance
      ✔ should unstake NFT and return to owner
      ✔ should reject double staking
    CrossChainBridge
      ✔ should allow owner to add relayers and chains
      ✔ should process inbound bridge message and mint PYT
      ✔ should reject duplicate inbound messages
      ✔ should reject unauthorized relayers

  15 passing (515ms)
```

### Deploy to Portaldot Testnet

```bash
cp .env.example .env
# Fill in PRIVATE_KEY and PORTALDOT_RPC_URL in .env

npx hardhat run scripts/deploy.js --network portaldot_testnet
```

---

## 💡 Key Features

- **Dual-standard protocol**: ERC-721 (assets) + ERC-20 (yield tokens) on Portaldot EVM
- **Permissioned issuance**: Whitelisted issuers ensure compliance
- **Real-time yield accrual**: On-chain yield calculation, no oracles needed for accrual
- **Cross-chain PYT**: Bridge to/from other EVM chains via Portaldot's multi-chain infra
- **Composable modules**: Vault, token, and bridge are independent; plug into any Portaldot DeFi

---

## 🎯 Market Opportunity

The Real World Asset tokenization market is projected to reach **$16 trillion by 2030** (BlackRock, BCG estimates). PortalYield brings institutional-grade yield products to the Portaldot ecosystem with:

- **Institutional access**: T-Bills, bonds, real estate on-chain
- **Retail participation**: Any user can earn yield via PYT tokens
- **Cross-chain liquidity**: Portaldot's bridge makes PYT usable everywhere

---

## 👤 Team

Solo developer — [Your Name]

---

## 📜 License

MIT
