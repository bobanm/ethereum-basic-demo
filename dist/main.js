import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config.js'

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
            contractAddress: CONTRACT_ADDRESS,
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
        async send () {
            this.isSending = true
            this.transactionType = 'Transfer to contract'
            this.transactionHash = ''
            this.transactionBlock = 0
            this.errorMessage = ''

            const amountWei = ethers.utils.parseEther(this.amountEth)

            try {
                const transaction = await signer.sendTransaction({
                    to: CONTRACT_ADDRESS,
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

    async mounted () {

        if (!window.ethereum) {
            this.isFatalError = true
            this.errorMessage = 'MetaMask not detected. Please install MetaMask and refresh the page.'

            return
        }

        provider = new ethers.providers.Web3Provider(window.ethereum)
        signer = provider.getSigner()
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        const network = await provider.getNetwork()
        this.networkName = network.name
        this.networkId = network.chainId
        this.blockNumber = await provider.getBlockNumber()
        const accounts = await provider.send('eth_requestAccounts', [])
        this.accountAddress = accounts[0]
        this.accountBalanceWei = await provider.getBalance(this.accountAddress)
        this.contractBalanceWei = await provider.getBalance(CONTRACT_ADDRESS)
        this.accountBalanceInContractWei = await contract.balances(this.accountAddress)
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