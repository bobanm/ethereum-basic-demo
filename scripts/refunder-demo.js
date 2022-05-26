// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // this is where your first contract on local Hardhat network will be deployed to
const CONTRACT_ADDRESS = '0xacCDe34BC1391aa8D3FEF3Bfaa568dFd9D1DA791' // this is the already deployed contract on Ropsten
const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const amount = 0.01

async function main () {

    const signer = await ethers.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

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