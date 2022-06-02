const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const deploymentConfig = new Map([
    [3,      { address: '0xacCDe34BC1391aa8D3FEF3Bfaa568dFd9D1DA791', blockNumber: 12277906, networkName: 'ropsten' }],
    [4,      { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 10778311, networkName: 'rinkeby' }],
    [5,      { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 6987150,  networkName: 'goerli' }],
    [42,     { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 31946295, networkName: 'kovan' }],
    [69,     { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 3629298,  networkName: 'optimism-kovan' }],
    [421611, { address: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', blockNumber: 12240862, networkName: 'arbitrum-rinkeby' }],
    [31337,  { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', blockNumber: 0,        networkName: 'hardhat' }],
])

export { deploymentConfig, CONTRACT_ABI }