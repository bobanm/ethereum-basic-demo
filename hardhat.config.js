require("@nomiclabs/hardhat-waffle")

const { generateInfuraUrl, generateAlchemyUrl } = require('./utils/generate-url')
const { ALCHEMY_API_KEY, INFURA_API_KEY, PRIVATE_KEYS } = require('./.credentials')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.8.13",

    networks: {
        ropsten: {
            url: generateAlchemyUrl('ropsten', ALCHEMY_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        rinkeby: {
            url: generateInfuraUrl('rinkeby', INFURA_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        optimism_kovan: {
            url: 'https://kovan.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        arbitrum_rinkeby: {
            url: 'https://rinkeby.arbitrum.io/rpc',
            accounts: PRIVATE_KEYS,
        },
    }
}
