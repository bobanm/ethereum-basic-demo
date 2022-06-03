async function main () {

    const contractFactory = await ethers.getContractFactory('Refunder')
    const contract = await contractFactory.deploy()
    console.log(`Deploying contract ${contract.address}\n` +
        `Transaction ${contract.deployTransaction.hash}\n`)
    await contract.deployed()

    console.log('Contract successfully deployed');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })