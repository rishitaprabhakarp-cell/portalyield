require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    // HARDHAT_CHAIN_ID lets a second `hardhat node` stand in for a remote EVM chain.
    hardhat: {
      chainId: parseInt(process.env.HARDHAT_CHAIN_ID || "31337"),
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    remote_local: {
      url: "http://127.0.0.1:8546",
      chainId: 31338,
    },
    portaldot_testnet: {
      url: process.env.PORTALDOT_RPC_URL || "https://rpc-testnet.portaldot.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.PORTALDOT_CHAIN_ID || "9999"),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
