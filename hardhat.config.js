require('@nomiclabs/hardhat-waffle')

// for demo purposes, we'll access some networks using Infura, and some others using alchemy
const { generateInfuraUrl, generateAlchemyUrl } = require('./utils/generate-url')
const { ALCHEMY_API_KEY, INFURA_API_KEY, PRIVATE_KEYS } = require('./.credentials')

task("balance", "Prints an account's balance")
    .addParam("address", "The account's address")
    .setAction(async (args) => {
        const balance = await ethers.provider.getBalance(args.address)
        console.log(`${args.address} = ${ethers.utils.formatEther(balance)} ETH`)
    })

task("balances", "Prints balances of all configured accounts")
    .setAction(async () => {
        const accounts = await ethers.getSigners()

        if (!accounts.length) {
            console.log('No accounts detected. Configure them in your Hardhat config file.')

            return
        }

        console.log(
            `${accounts.length} accounts configured\n\n` +
            'ACCOUNT                                      BALANCE ETH\n' +
            '-----------------------------------------------------------------'
        )
        for (const account of accounts) {
            const balance = await ethers.provider.getBalance(account.address)
            console.log(`${account.address}   ${ethers.utils.formatEther(balance)}`)
        }
    })

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
        goerli: {
            url: generateAlchemyUrl('goerli', ALCHEMY_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        kovan: {
            url: generateInfuraUrl('kovan', INFURA_API_KEY),
            accounts: PRIVATE_KEYS,
        },
        'optimism-kovan': {
            url: 'https://kovan.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        'arbitrum-rinkeby': {
            url: 'https://rinkeby.arbitrum.io/rpc',
            accounts: PRIVATE_KEYS,
        },
    }
}
