const path = require("path");

require('./client/node_modules/dotenv-extended').config()
const HDWalletProvider = require('./client/node_modules/@truffle/hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/build"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    kovan: {//the public blockchain network
      provider: () => new HDWalletProvider(
                     "goddess blush excuse phone garment cycle document turn resemble you drift initial",
                    "https://kovan.infura.io/v3/781d6fc8e6ea4d869ef23e0d9d07ac0a"
                    ),
      network_id: 42,
      gas: 3000000,
      gasPrice: 100
},
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },


};
