// const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // this is where your first contract on local Hardhat network will be deployed to
const CONTRACT_ADDRESS = '0xacCDe34BC1391aa8D3FEF3Bfaa568dFd9D1DA791' // this is the already deployed contract on Ropsten
const CONTRACT_ABI = [
    'event PaymentReceived (address indexed from, uint amount)',
    'event AccountRefunded (address indexed to, uint amount)',
    'function balances (address) view public returns (uint)',
    'function paymentsCount () view public returns (uint)',
    'function refundsCount () view public returns (uint)',
    'function refund () public',
]

export { CONTRACT_ADDRESS, CONTRACT_ABI }