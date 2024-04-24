const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const deploymentConfig = new Map([
    [11155111, { address: '0xa06E8dEA72E7530718e9d66F32404Ae372841156', blockNumber: 5766007,  networkName: 'sepolia' }],
    [11155420, { address: '0x1f101039EB1775dfb8B5014c21a6D67fEFF9d681', blockNumber: 11072631, networkName: 'optimism-sepolia' }],
    [421614,   { address: '0x1f101039EB1775dfb8B5014c21a6D67fEFF9d681', blockNumber: 36965333, networkName: 'arbitrum-sepolia' }],
    [31337,    { address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', blockNumber: 0,        networkName: 'hardhat' }],
])

const DEFAULT_NETWORK = 'sepolia'

export { deploymentConfig, CONTRACT_ABI, DEFAULT_NETWORK }