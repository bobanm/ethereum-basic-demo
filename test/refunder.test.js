const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Refunder', function () {

    let contract, contractFactory, signerUser, signerOwner
    const amount = ethers.utils.parseEther('1')

    before(async function () {
        [signerUser, signerOwner] = await ethers.getSigners()
        contractFactory = await ethers.getContractFactory('Refunder', signerOwner) // explicitly select a signer to deploy the contract
    })

    beforeEach(async function () {
        contract = await contractFactory.deploy()
        await contract.deployed()
    })

    it('Increases contract balance and payments counter after a payment', async function () {

        const paymentsCount = await contract.paymentsCount()
        await expect(await signerUser.sendTransaction({ to: contract.address, value: amount })).to.changeEtherBalance(contract, amount)
        expect(await contract.paymentsCount()).to.equal(paymentsCount + 1)
    })

    it('Emits an event after receiving a payment', async function () {

        await expect(await signerUser.sendTransaction({ to: contract.address, value: amount })).to.emit(contract, 'PaymentReceived').withArgs(signerUser.address, amount)
    })

    it('Increases account balance and refunds counter after a refund', async function () {

        const refundsCountBeforeRefund = await contract.refundsCount()
        const contractUser = contract.connect(signerUser) // new contract reference which allows signerUser to modify the state

        await signerUser.sendTransaction({ to: contract.address, value: amount })
        await expect(await contractUser.refund()).to.changeEtherBalance(signerUser, amount)

        const refundsCountAfterRefund = await contract.refundsCount()
        expect(refundsCountAfterRefund).to.equal(refundsCountBeforeRefund + 1)
    })

    it('Emits an event after issuing a refund', async function () {

        await signerOwner.sendTransaction({ to: contract.address, value: amount })
        await expect(await contract.refund()).to.emit(contract, 'AccountRefunded').withArgs(signerOwner.address, amount)
    })

    it('Reverts if an address with 0 balance initiates a refund', async function () {

        // await expect(contractSignerUser.refund()).to.be.reverted
        await expect(contract.refund()).to.be.revertedWith('Address balance is 0')
    })

    it('Refunds multiple transactions from the same account as 1 transaction with the total amount', async function () {

        const PAYMENTS_COUNT = 3
        let totalAmountTransferred = 0
        const contractUser = contract.connect(signerUser) // new contract reference which allows signerUser to modify the state

        for (let i = 1; i <= PAYMENTS_COUNT; i++) {
            totalAmountTransferred += i
            await signerUser.sendTransaction({ to: contract.address, value: ethers.utils.parseEther(String(i)) })
        }

        const totalAmountFromAccount = await contract.balances(signerUser.address)
        const contractBalance = await ethers.provider.getBalance(contract.address)

        expect(totalAmountTransferred).to.equal(Number(ethers.utils.formatEther(totalAmountFromAccount)))
        expect(contractBalance).to.equal(totalAmountFromAccount)
        expect(await contract.paymentsCount()).to.equal(PAYMENTS_COUNT)
        await expect (await contractUser.refund()).to.changeEtherBalance(signerUser, totalAmountFromAccount)
    })
})