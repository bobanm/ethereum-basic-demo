const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const deploymentConfig = new Map([
    [5,      { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 6987150,  networkName: 'goerli' }],
    [420,    { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 1374064,  networkName: 'optimism-goerli' }],
    [421613, { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 392644,   networkName: 'arbitrum-goerli' }],
    [31337,  { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', blockNumber: 0,        networkName: 'hardhat' }],
])

const DEFAULT_NETWORK = 'ropsten'

export { deploymentConfig, CONTRACT_ABI, DEFAULT_NETWORK }