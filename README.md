# PortalYield: RWA yield protocol on Portaldot Network V3.0

> Track: Ecosystem DApps. Portaldot Network Hacker House 2026.

PortalYield tokenizes real-world assets (treasury bills, corporate bonds, real estate) as ERC-721 tokens on Portaldot's EVM layer. Staking an asset mints PYT, an ERC-20 worth $1 per dollar of face value, and the vault pays yield in PYT every second at the asset's fixed rate. PYT can be bridged to other EVM chains and back.

## Status

| Piece | State |
|---|---|
| Contracts (4) | Done, 22 tests passing |
| Web app | Done: claim demo assets, stake, live yield, claim, unstake, bridge both ways |
| Bridge relayer | Done, local two-chain setup |
| Portaldot testnet deployment | Pending testnet RPC access |

### Testnet deployment

| Contract | Address | Deploy tx |
|---|---|---|
| RWAAsset (ERC-721) | TBD | TBD |
| YieldToken PYT (ERC-20) | TBD | TBD |
| PortalYieldVault | TBD | TBD |
| CrossChainBridge | TBD | TBD |

## Architecture

```
            Portaldot (home chain)                          Remote EVM chain
 ┌──────────────────────────────────────────┐       ┌─────────────────────────────┐
 │  RWAAsset (ERC-721)                       │       │                             │
 │    issuer mint / demo claim               │       │                             │
 │        │ stake            ▲ unstake       │       │                             │
 │        ▼                  │               │       │                             │
 │  PortalYieldVault ── mint / burn ──┐      │       │                             │
 │    accrues yield per second        ▼      │       │                             │
 │                           YieldToken PYT  │       │  YieldToken PYT             │
 │                                    ▲      │       │        ▲                    │
 │  CrossChainBridge ── burn / mint ──┘      │       │  CrossChainBridge           │
 │    BridgeOutInitiated event ──────────────┼──┐ ┌──┼─▶ bridgeIn (relayer only)   │
 └──────────────────────────────────────────┘  │ │  └─────────────────────────────┘
                                               ▼ │
                                        scripts/relayer.js
                              (watches both bridges, nonces prevent replay)
```

### How it works

1. **Tokenize.** Whitelisted issuers mint an ERC-721 per asset with its issuer, face value, annual yield and maturity stored on-chain. On testnet, demo mode lets any wallet claim one of three sample assets.
2. **Stake.** The vault takes the NFT and mints 1 PYT per $1 of face value.
3. **Earn.** Yield accrues per second at the asset's rate and stops at maturity. `getPositions(address)` returns every open position with its pending yield.
4. **Claim or unstake.** Claim yield any time. Unstaking returns the NFT, burns the principal PYT and pays out remaining yield.
5. **Bridge.** `bridgeOut` burns PYT and emits an event. The relayer calls `bridgeIn` on the destination bridge, which mints PYT once per `(sourceChain, nonce)`.

### Portaldot V3.0 features used

| Feature | Use |
|---|---|
| EVM compatibility | All contracts are Solidity 0.8.26 on Portaldot's EVM layer |
| ERC-721 | Each real-world asset and its terms |
| ERC-20 | PYT principal and yield token |
| Multi-chain | PYT bridge between Portaldot and other EVM chains |
| Modular architecture | Asset registry, vault, token and bridge are separate contracts wired by permissions |

## Project structure

```
contracts/
  RWAAsset.sol           ERC-721 asset registry, issuer whitelist, demo claims
  YieldToken.sol         PYT ERC-20 with owner-approved minters (vault, bridge)
  PortalYieldVault.sol   Stake, accrue, claim, unstake, position reads
  CrossChainBridge.sol   Burn-and-mint bridge with relayer allowlist and replay protection
scripts/
  deploy.js              Home-chain deploy + permissions; exports ABIs/addresses to the frontend
  deploy-remote.js       PYT + bridge on the remote chain
  relayer.js             Bridge relayer for both directions
  interact.js            Scripted end-to-end flow
test/PortalYield.test.js 22 tests
frontend/                Next.js 15 + wagmi/viem app (landing page at /, app at /app)
```

## Run it locally

Needs Node.js 18+. Uses five terminals: two chains, the relayer, and the web app, plus one for commands.

```bash
npm install
cd frontend && npm install && cd ..

npm test                 # 22 contract tests

npm run node             # terminal 1: home chain (Portaldot stand-in), chain 31337, port 8545
npm run node:remote      # terminal 2: remote chain (Ethereum stand-in), chain 31338, port 8546
npm run deploy:local     # deploys to both chains and writes frontend/lib/deployments.json
npm run relayer          # terminal 3: relays bridge transfers between the two chains
cd frontend && npm run dev   # terminal 4: http://localhost:3000
```

Open [http://localhost:3000/app](http://localhost:3000/app) and choose **Use local dev account**. No browser extension needed; transactions are signed by the local node. Then:

1. Claim a demo asset.
2. Approve and stake it. PYT appears in your balance.
3. Use **+30 days** to move the local chain forward and watch yield accrue.
4. Claim the yield.
5. Bridge PYT to Ethereum (local) and back. The transfer shows **Delivered** once the relayer mints it.
6. Unstake to get the asset back. You need the full principal in PYT on the home chain.

MetaMask also works: add network `http://127.0.0.1:8545` with chain ID 31337 and import a Hardhat dev key.

Restarting the chains wipes them, so run `npm run deploy:local` again afterwards.

## Deploy to Portaldot testnet

```bash
cp .env.example .env     # set PRIVATE_KEY, PORTALDOT_RPC_URL, PORTALDOT_CHAIN_ID
npm run deploy:portaldot
```

The deployer becomes the relayer unless `RELAYER_ADDRESS` is set, and `REMOTE_CHAIN_ID` sets the bridge route. For the frontend, set `NEXT_PUBLIC_HOME_CHAIN_ID`, `NEXT_PUBLIC_PORTALDOT_RPC_URL` and optionally `NEXT_PUBLIC_PORTALDOT_EXPLORER_URL`.

## Known limits

- The relayer is a single trusted key. Production would use Portaldot's native cross-chain messaging or a multi-relayer quorum.
- Yield is minted as new PYT and isn't yet backed by off-chain coupon payments flowing in. That needs an issuer-funded reserve or oracle.
- `tokensOfOwner` scans all token IDs. That's fine at demo scale; an indexer should replace it.

## Third-party code

OpenZeppelin Contracts 5 (MIT), Hardhat, wagmi, viem, Next.js, Tailwind CSS, lucide-react.

## Team

Solo developer.

## License

MIT
