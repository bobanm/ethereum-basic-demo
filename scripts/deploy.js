async function main () {

    const contractFactory = await ethers.getContractFactory('Refunder')
    const contract = await contractFactory.deploy()
    await contract.deployed()

    console.log('Contract deployed to:', contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })