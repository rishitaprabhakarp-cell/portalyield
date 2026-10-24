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
    // Leave PORTALDOT_CHAIN_ID unset to accept whatever chain ID the RPC reports.
    portaldot_testnet: {
      url: process.env.PORTALDOT_RPC_URL || "http://127.0.0.1:9933",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      ...(process.env.PORTALDOT_CHAIN_ID && { chainId: parseInt(process.env.PORTALDOT_CHAIN_ID) }),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
