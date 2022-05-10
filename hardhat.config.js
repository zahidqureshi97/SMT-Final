require("@nomiclabs/hardhat-waffle");

const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: 'https://polygon-mumbai.infura.io/v3/4807065878a64fc6ae3796e91b848802',
      accounts: [privateKey]
    },
    mainnet: {
      url: 'https://polygon-mumbai.infura.io/v3/4807065878a64fc6ae3796e91b848802',
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
