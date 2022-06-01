const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const networkConfig = new Map([
    [3,      { contractAddress: '0xacCDe34BC1391aa8D3FEF3Bfaa568dFd9D1DA791', networkName: 'ropsten' }],
    [4,      { contractAddress: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', networkName: 'rinkeby' }],
    [5,      { contractAddress: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', networkName: 'goerli' }],
    [42,     { contractAddress: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', networkName: 'kovan' }],
    [69,     { contractAddress: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', networkName: 'optimism-kovan' }],
    [421611, { contractAddress: '0x177dd8098dD548f8206067AFFE101D6C8288B19D', networkName: 'arbitrum-rinkeby' }],
    [31337,  { contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', networkName: 'hardhat' }],
])

export { networkConfig, CONTRACT_ABI }