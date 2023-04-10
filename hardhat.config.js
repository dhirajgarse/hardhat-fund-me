require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("hardhat-gas-reporter");
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-deploy");
/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    }, 
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  solidity: {
    compilers: [{version: "0.8.18"}, {version: "0.6.6"}]
  },
  
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    token: "MATIC"
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  }
};
