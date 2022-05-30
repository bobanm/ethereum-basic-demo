const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

const networkConfig = new Map([
    [ 31337,  '0x5FbDB2315678afecb367f032d93F642f64180aa3' ], // hardhat
    [ 3,      '0xacCDe34BC1391aa8D3FEF3Bfaa568dFd9D1DA791' ], // ropsten
    [ 4,      '' ], // rinkeby
    [ 5,      '' ], // goerli
    [ 42,     '' ], // kovan
    [ 69,     '' ], // optimism-kovan
    [ 421611, '' ], // arbitrum-rinkeby
])

export { networkConfig, CONTRACT_ABI }