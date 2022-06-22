import { deploymentConfig, CONTRACT_ABI } from './config.js'

let provider, signer, contract

const app = {
    data () {
        return {
            networkName: '',
            networkId: 0,
            networksAvailable: [],
            blockNumber: 0,
            accountAddress: '',
            accountBalanceWei: 0,
            amountEth: '',
            contractAddress: '',
            contractBalanceWei: 0,
            accountBalanceInContractWei: 0,
            paymentsCount: 0,
            refundsCount: 0,
            payments: [],
            refunds: [],
            isShowPayments: false,
            isShowRefunds: false,
            isSending: false,
            isRefunding: false,
            transactionType: '',
            transactionHash: '',
            transactionBlock: 0,
            errorMessage: '',
            isFatalError: false,
            showModal: false,
        }
    },

    methods: {

        // initializes network-dependent values
        async init () {

            provider = new ethers.providers.Web3Provider(window.ethereum)

            const providerNetwork = await provider.getNetwork()
            this.networkName = providerNetwork.name
            this.networkId = providerNetwork.chainId

            this.isFatalError = false
            this.clearTransactionState()

            if (!deploymentConfig.get(this.networkId)) {
                this.isFatalError = true
                this.errorMessage = `The contract is currently deployed only on these networks: ${this.networksAvailable.join(', ')}.\n` +
                    `If you need support for ${this.networkName} [chain ID = ${this.networkId}], please deploy a contract there and update config.\n` +
                    'Otherwise, select one of supported networks in your wallet.'

                return
            }

            this.contractAddress = deploymentConfig.get(this.networkId).address
            
            await this.initAccount()
            
            try {
                [
                    this.blockNumber,
                    this.contractBalanceWei,
                    this.paymentsCount,
                    this.refundsCount,
                ] = await Promise.all([
                    provider.getBlockNumber(),
                    provider.getBalance(this.contractAddress),
                    contract.paymentsCount(),
                    contract.refundsCount(),
                ])
            }
            catch (error) {
                console.log(error)
            }

            provider.on('block', (blockNumber) => this.blockNumber = blockNumber)
        },

        // initializes account-dependent values
        async initAccount () {

            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            signer = provider.getSigner()
            contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer)
            const contractDeployBlockNumber = deploymentConfig.get(this.networkId).blockNumber

            try {
                [
                    this.accountBalanceWei,
                    this.accountBalanceInContractWei,
                    this.payments,
                    this.refunds,
                ] = await Promise.all([
                    provider.getBalance(this.accountAddress),
                    contract.balances(this.accountAddress),
                    this.processLogs('PaymentReceived', this.accountAddress, contractDeployBlockNumber),
                    this.processLogs('AccountRefunded', this.accountAddress, contractDeployBlockNumber),
                ])
            }
            catch (error) {
                console.log(error)
            }
        },

        // util function to process logs and parse log data
        async processLogs (event, address, fromBlock) {

            const result = []
            const filter = contract.filters[event](address)
            const logs = await contract.queryFilter(filter, fromBlock)

            for (const log of logs) {
                result.push({ blockNumber: log.blockNumber, amount: ethers.utils.formatEther(log.args.amount) })
            }

            return result.reverse()
        },

        async send () {

            this.isSending = true
            this.transactionType = 'Transfer to contract'
            this.clearTransactionState()

            const amountWei = ethers.utils.parseEther(this.amountEth)

            try {
                const transaction = await signer.sendTransaction({ to: this.contractAddress, value: amountWei })
                const receipt = await this.processTransaction(transaction)
                this.payments.unshift(this.getDecodedLogData(receipt)) // add new payment details to the top of payments list
                await this.updateBalances()
                this.amountEth = ''
            }
            catch (error) {
                this.errorMessage = error.message
                console.log(error)
            }
            finally {
                this.isSending = false
            }
        },

        async refund () {

            this.isRefunding = true
            this.transactionType = 'Refund from contract'
            this.clearTransactionState()

            try {
                const transaction = await contract.refund()
                const receipt = await this.processTransaction(transaction)
                this.refunds.unshift(this.getDecodedLogData(receipt)) // add new refund details to the top of the refunds list
                await this.updateBalances()
            }
            catch (error) {
                this.errorMessage = error.message
                console.log(error)
            }
            finally {
                this.isRefunding = false
            }
        },

        clearTransactionState () {

            this.transactionHash = ''
            this.transactionBlock = 0
            this.errorMessage = ''
        },

        async processTransaction (transaction) {

            this.transactionHash = transaction.hash
            console.log(transaction)

            const receipt = await transaction.wait()
            this.transactionBlock = receipt.blockNumber
            this.blockNumber = receipt.blockNumber
            console.log(receipt)

            return receipt
        },

        async updateBalances () {

            try {
                [
                    this.accountBalanceWei,
                    this.contractBalanceWei,
                    this.accountBalanceInContractWei,
                    this.paymentsCount,
                    this.refundsCount,
                ] = await Promise.all([
                    provider.getBalance(this.accountAddress),
                    provider.getBalance(this.contractAddress),
                    contract.balances(this.accountAddress),
                    contract.paymentsCount(),
                    contract.refundsCount(),
                ])
            }
            catch (error) {
                console.log(error)
            }
        },

        getDecodedLogData (receipt) {

            const parsedLog = contract.interface.parseLog(receipt.logs[0])

            return { blockNumber: receipt.logs[0].blockNumber, amount: ethers.utils.formatEther(parsedLog.args.amount) }
        },
    },

    async created () {

        if (!window.ethereum) {
            this.isFatalError = true
            this.errorMessage = 'MetaMask not detected. Please install MetaMask and refresh the page.'

            return
        }

        // populate the list of all the networks where the contract has been deployed to
        for (const deploymentConfigEntry of deploymentConfig) {
            this.networksAvailable.push(deploymentConfigEntry[1].networkName)
        }

        await this.init()

        window.ethereum.on('chainChanged', () => { this.init() })
        window.ethereum.on('accountsChanged', () => { this.initAccount() })
    },

    computed: {
        accountBalanceEth () {
            return Number(ethers.utils.formatEther(this.accountBalanceWei)).toFixed(5)
        },
        contractBalanceEth () {
            return ethers.utils.formatEther(this.contractBalanceWei)
        },
        accountBalanceInContractEth () {
            return ethers.utils.formatEther(this.accountBalanceInContractWei)
        },
    }
}

Vue.createApp(app).mount('#app')