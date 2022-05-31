import { networkConfig, CONTRACT_ABI } from './config.js'

let provider, signer, contract

const app = {
    data () {
        return {
            networkName: '',
            networkId: 0,
            blockNumber: 0,
            accountAddress: '',
            accountBalanceWei: 0,
            amountEth: '',
            contractAddress: '',
            contractBalanceWei: 0,
            accountBalanceInContractWei: 0,
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

            if (!networkConfig.get(this.networkId)) {
                this.isFatalError = true
                this.errorMessage = `No contract address configured for ${this.networkName} network with ID ${this.networkId}. Please update config file and deploy a new contract instance if needed.`

                return
            }

            this.contractAddress = networkConfig.get(this.networkId)
            contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer)

            this.blockNumber = await provider.getBlockNumber()
            const accounts = await provider.send('eth_requestAccounts', [])
            this.accountAddress = accounts[0]
            this.accountBalanceWei = await provider.getBalance(this.accountAddress)
            this.contractBalanceWei = await provider.getBalance(this.contractAddress)
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

        await this.init()

        window.ethereum.on('chainChanged', () => { this.init() })
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