// Contract ABIs and addresses for PortalYield on Portaldot Network V3.0

export const PORTALDOT_TESTNET = {
  id: 9999,
  name: "Portaldot Testnet",
  network: "portaldot-testnet",
  nativeCurrency: { name: "POT", symbol: "POT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.portaldot.io"] },
    public: { http: ["https://rpc-testnet.portaldot.io"] },
  },
  blockExplorers: {
    default: { name: "Portaldot Explorer", url: "https://explorer-testnet.portaldot.io" },
  },
} as const;

// Update after deployment
export const CONTRACT_ADDRESSES = {
  RWAAsset: process.env.NEXT_PUBLIC_RWA_ASSET_ADDRESS || "0x0000000000000000000000000000000000000000",
  YieldToken: process.env.NEXT_PUBLIC_YIELD_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  PortalYieldVault: process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x0000000000000000000000000000000000000000",
  CrossChainBridge: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

export const RWA_ASSET_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "uri", "type": "string"}, {"name": "assetType", "type": "uint8"}, {"name": "issuer", "type": "string"}, {"name": "faceValue", "type": "uint256"}, {"name": "maturityDate", "type": "uint256"}, {"name": "annualYieldBPS", "type": "uint256"}],
    "name": "mintAsset",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "getAssetData",
    "outputs": [{"name": "", "type": "tuple", "components": [{"name": "assetType", "type": "uint8"}, {"name": "issuer", "type": "string"}, {"name": "faceValue", "type": "uint256"}, {"name": "maturityDate", "type": "uint256"}, {"name": "annualYieldBPS", "type": "uint256"}, {"name": "isActive", "type": "bool"}, {"name": "mintedAt", "type": "uint256"}, {"name": "originalOwner", "type": "address"}]}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "accruedYield",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "tokenId", "type": "uint256"}],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

export const YIELD_TOKEN_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

export const VAULT_ABI = [
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "pendingYield",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "staker", "type": "address"}],
    "name": "getStakerTokens",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVaultStats",
    "outputs": [{"name": "totalStaked", "type": "uint256"}, {"name": "totalPYT", "type": "uint256"}, {"name": "totalYield", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
] as const;

export const ASSET_TYPE_LABELS: Record<number, string> = {
  0: "T-Bill",
  1: "Corporate Bond",
  2: "Real Estate",
  3: "Commodity",
  4: "Equity",
};
