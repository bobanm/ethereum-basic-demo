const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Refunder', function () {

    let refunder, refunderFactory, user, owner
    const amount = ethers.utils.parseEther('1').toBigInt()

    before(async function () {
        [user, owner] = await ethers.getSigners()
        refunderFactory = await ethers.getContractFactory('Refunder', owner) // explicitly select a signer to deploy the contract
    })

    beforeEach(async function () {
        refunder = await refunderFactory.deploy()
        await refunder.deployed()
    })

    it('Increases contract balance and payments counter after a payment', async function () {

        const paymentsCount = await refunder.paymentsCount()
        const transaction = await user.sendTransaction({ to: refunder.address, value: amount })
        await expect(transaction).to.changeEtherBalances([refunder, user], [amount, -amount])
        expect(await refunder.paymentsCount()).to.equal(paymentsCount + 1)
    })

    it('Emits an event after receiving a payment', async function () {

        await expect(await user.sendTransaction({ to: refunder.address, value: amount })).to.emit(refunder, 'PaymentReceived').withArgs(user.address, amount)
    })

    it('Increases account balance and refunds counter after a refund', async function () {

        const refundsCountBeforeRefund = await refunder.refundsCount()
        const refunderUser = refunder.connect(user) // new contract reference which allows signerUser to modify the state

        await user.sendTransaction({ to: refunder.address, value: amount })
        await expect(await refunderUser.refund()).to.changeEtherBalances([refunderUser, user], [-amount, amount])

        const refundsCountAfterRefund = await refunder.refundsCount()
        expect(refundsCountAfterRefund).to.equal(refundsCountBeforeRefund + 1)
    })

    it('Emits an event after issuing a refund', async function () {

        await owner.sendTransaction({ to: refunder.address, value: amount })
        await expect(await refunder.refund()).to.emit(refunder, 'AccountRefunded').withArgs(owner.address, amount)
    })

    it('Reverts if an address with 0 balance initiates a refund', async function () {

        // await expect(contractSignerUser.refund()).to.be.reverted
        await expect(refunder.refund()).to.be.revertedWith('Account balance in contract is 0')
    })

    it('Refunds multiple transactions from the same account as 1 transaction with the total amount', async function () {

        const PAYMENTS_COUNT = 3
        let totalAmountTransferred = 0
        const refunderUser = refunder.connect(user) // new contract reference which allows signerUser to modify the state

        for (let i = 1; i <= PAYMENTS_COUNT; i++) {
            totalAmountTransferred += i
            await user.sendTransaction({ to: refunder.address, value: ethers.utils.parseEther(String(i)) })
        }

        const totalAmountFromAccount = (await refunder.balances(user.address)).toBigInt()
        const contractBalance = (await ethers.provider.getBalance(refunder.address)).toBigInt()

        expect(totalAmountTransferred).to.equal(Number(ethers.utils.formatEther(totalAmountFromAccount)))
        expect(contractBalance).to.equal(totalAmountFromAccount)
        expect(await refunder.paymentsCount()).to.equal(PAYMENTS_COUNT)
        await expect (await refunderUser.refund()).to.changeEtherBalances([refunderUser, user], [-totalAmountFromAccount, totalAmountFromAccount])
    })
})