import { deploymentConfig, CONTRACT_ABI } from './config.js'

let provider, signer, contract, contractInterface

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

            this.blockNumber = await provider.getBlockNumber()
            this.contractAddress = deploymentConfig.get(this.networkId).address

            await this.initAccount()

            this.contractBalanceWei = await provider.getBalance(this.contractAddress)
            this.paymentsCount = await contract.paymentsCount()
            this.refundsCount = await contract.refundsCount()

            provider.on('block', (blockNumber) => this.blockNumber = blockNumber)
        },

        // initializes account-dependent values
        async initAccount () {

            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            signer = provider.getSigner()

            contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer)
            this.accountBalanceWei = await provider.getBalance(this.accountAddress)
            this.accountBalanceInContractWei = await contract.balances(this.accountAddress)

            // fetch all events for this account
            const contractDeployBlockNumber = deploymentConfig.get(this.networkId).blockNumber
            this.payments = await this.processLogs('PaymentReceived', this.accountAddress, contractDeployBlockNumber)
            this.refunds = await this.processLogs('AccountRefunded', this.accountAddress, contractDeployBlockNumber)
        },

        // util function to process logs and parse log data
        async processLogs (event, address, fromBlock) {

            const result = []
            const filter = contract.filters[event](address)
            filter.fromBlock = fromBlock
            const logs = await provider.getLogs(filter)

            for (const log of logs) {
                const parsedLog = contractInterface.parseLog(log)
                result.push({ blockNumber: log.blockNumber, amount: ethers.utils.formatEther(parsedLog.args.amount) })
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

            this.accountBalanceWei = await provider.getBalance(this.accountAddress)
            this.contractBalanceWei = await provider.getBalance(this.contractAddress)
            this.accountBalanceInContractWei = await contract.balances(this.accountAddress)
            this.paymentsCount = await contract.paymentsCount()
            this.refundsCount = await contract.refundsCount()
        },

        getDecodedLogData (receipt) {

            const parsedLog = contractInterface.parseLog(receipt.logs[0])

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

        contractInterface = new ethers.utils.Interface(CONTRACT_ABI)
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