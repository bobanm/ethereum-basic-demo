require('@nomiclabs/hardhat-waffle')

const { ALCHEMY_API_KEY, PRIVATE_KEYS } = require('./.credentials')

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
        goerli: {
            url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
            accounts: PRIVATE_KEYS,
        },
        'optimism-goerli': {
            url: 'https://goerli.optimism.io',
            accounts: PRIVATE_KEYS,
        },
        'arbitrum-goerli': {
            url: 'https://goerli-rollup.arbitrum.io/rpc/',
            accounts: PRIVATE_KEYS,
        },
    }
}
