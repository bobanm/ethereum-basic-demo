/*

    This CLI demo does not deploy a contract, but assumes there is one already deployed.
    I have already deployed it on Sepolia, and that is the default value for CONTRACT_ADDRESS
    below. Of course, you can deploy your own version to Sepolia or any other blockchain, and
    replace value of CONTRACT_ADDRESS by your own.

    To run this demo on Sepolia:

    pnpm hardhat run ./scripts/refunder-demo.js --network sepolia

    If you want to use it with Hardhat's in-memory blockchain, you will first need to start a local
    blockchain:

    pnpm hardhat node

    Then in another terminal deploy the contract to the local blockchain:

    pnpm hardhat run ./scripts/deploy --network localhost

    If that was the first contract you deployed to that newly created local blockchain, its address
    will be 0x5FbDB2315678afecb367f032d93F642f64180aa3. Before running the demo on the local
    blockchain, make sure to uncomment the correct CONTRACT_ADDRESS constant down in the code, or
    provide an address where you have deployed the contract. After that, you can run the demo on
    the same local blockchain:

    pnpm hardhat run ./scripts/refunder-demo.js --network localhost

*/

const { ethers } = require('hardhat')

// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // this is where your first contract on local Hardhat blockchain will be deployed to
const CONTRACT_ADDRESS = '0xa06E8dEA72E7530718e9d66F32404Ae372841156' // this is the already deployed contract on Sepolia

const amount = 0.01

async function main () {

    const signer = await ethers.getSigner()
    const contract = await ethers.getContractAt('Refunder', CONTRACT_ADDRESS, signer)

    console.log('\nINITIAL STATE')
    await printBalance(signer.address)
    await printBalance(CONTRACT_ADDRESS)
    console.log('---\n')

    // send ETH to contract from signerUser account
    console.log('TRANSFER')
    console.log(`Sending ${amount} ETH from ${signer.address} to ${CONTRACT_ADDRESS}...`)
    const transactionSend = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.utils.parseEther(String(amount))
    })
    console.log(`transaction hash: ${transactionSend.hash}`)
    const receiptSend = await transactionSend.wait()
    console.log(`mined in block: ${receiptSend.blockNumber}`)

    await printBalance(signer.address)
    await printBalance(CONTRACT_ADDRESS)

    const payment = await contract.balances(signer.address)
    const paymentEth = ethers.utils.formatEther(payment)
    console.log(`Contract has registered that ${signer.address} has deposited ${paymentEth} ETH`)

    const paymentsCount = await contract.paymentsCount()
    console.log(`Contract received ${paymentsCount} payments`)
    console.log('---\n')

    // refund ETH back to signerUser account from the contract
    const contractUser = contract.connect(signer)
    console.log('REFUND')
    console.log(`Refunding ${paymentEth} ETH from ${CONTRACT_ADDRESS} to ${signer.address}...`)
    const transactionRefund = await contractUser.refund() // request refund from user's account
    console.log(`transaction hash: ${transactionRefund.hash}`)
    const receiptRefund = await transactionRefund.wait()
    console.log(`mined in block: ${receiptRefund.blockNumber}`)

    console.log(`Refunded event, to field: ${receiptRefund.events[0].args.to}`)
    console.log(`Refunded event, amount field: ${ethers.utils.formatEther(receiptRefund.events[0].args.amount)}`)

    await printBalance(signer.address)
    await printBalance(CONTRACT_ADDRESS)

    const refundsCount = await contract.refundsCount()
    console.log(`Contract refunded ${refundsCount} accounts`)
}

async function printBalance(address) {

    const balance = await ethers.provider.getBalance(address)
    console.log(`Address ${address} balance is ${ethers.utils.formatEther(balance)} ETH`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })