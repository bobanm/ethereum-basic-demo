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
            signer = provider.getSigner()

            const providerNetwork = await provider.getNetwork()
            this.networkName = providerNetwork.name
            this.networkId = providerNetwork.chainId

            this.errorMessage = ''
            this.isFatalError = false
            this.transactionHash = ''
            this.transactionBlock = 0

            if (!deploymentConfig.get(this.networkId)) {
                this.isFatalError = true
                this.errorMessage = `The contract is currently deployed only on these networks: ${this.networksAvailable.join(', ')}.\n` +
                    `If you need support for ${this.networkName} [chain ID = ${this.networkId}], please deploy a contract there and update config.\n` +
                    'Otherwise, select one of supported networks in your wallet.'

                return
            }

            this.blockNumber = await provider.getBlockNumber()
            this.contractAddress = deploymentConfig.get(this.networkId).address
            contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer)
            this.contractBalanceWei = await provider.getBalance(this.contractAddress)
            this.paymentsCount = await contract.paymentsCount()
            this.refundsCount = await contract.refundsCount()

            provider.on('block', (blockNumber) => this.blockNumber = blockNumber)

            await this.initAccount()
        },

        // initializes account-dependent values
        async initAccount () {
            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            this.accountBalanceWei = await provider.getBalance(this.accountAddress)
            this.accountBalanceInContractWei = await contract.balances(this.accountAddress)
        },

        async send () {
            this.isSending = true
            this.transactionType = 'Transfer to contract'
            this.transactionHash = ''
            this.transactionBlock = 0
            this.errorMessage = ''

            const amountWei = ethers.utils.parseEther(this.amountEth)

            try {
                const transaction = await signer.sendTransaction({
                    to: this.contractAddress,
                    value: amountWei,
                })
                this.transactionHash = transaction.hash
                console.log(transaction)

                const receipt = await transaction.wait()
                this.transactionBlock = receipt.blockNumber
                this.blockNumber = receipt.blockNumber
                console.log(receipt)

                // update balances after transaction
                this.accountBalanceWei = await provider.getBalance(this.accountAddress)
                this.contractBalanceWei = await provider.getBalance(this.contractAddress)
                this.accountBalanceInContractWei = await contract.balances(this.accountAddress)
                this.paymentsCount = await contract.paymentsCount()
                this.refundsCount = await contract.refundsCount()

                this.amountEth = ''
            }
            catch (error) {
                if (error.code = 4001) {
                    this.errorMessage = 'Transaction rejected by user'
                }
                else {
                    this.errorMessage = error.message
                }
                console.log(error)
            }
            finally {
                this.isSending = false
            }
        },

        async refund () {
            this.isRefunding = true
            this.transactionType = 'Refund from contract'
            this.transactionHash = ''
            this.transactionBlock = 0
            this.errorMessage = ''

            try {
                const transaction = await contract.refund()
                this.transactionHash = transaction.hash
                console.log(transaction)

                const receipt = await transaction.wait()
                this.transactionBlock = receipt.blockNumber
                this.blockNumber = receipt.blockNumber
                console.log(receipt)

                // update balances after transaction
                this.accountBalanceWei = await provider.getBalance(this.accountAddress)
                this.contractBalanceWei = await provider.getBalance(this.contractAddress)
                this.accountBalanceInContractWei = await contract.balances(this.accountAddress)
                this.paymentsCount = await contract.paymentsCount()
                this.refundsCount = await contract.refundsCount()
            }
            catch (error) {
                if (error.code = 4001) {
                    this.errorMessage = 'Transaction rejected by user'
                }
                else {
                    this.errorMessage = error.message
                }
                console.log(error)
            }
            finally {
                this.isRefunding = false
            }
        }
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