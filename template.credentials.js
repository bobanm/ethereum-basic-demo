/*

    IMPORTANT

    This is just a template file, and it is not used by the app. In order for the app to use it:

    1. rename this file to .credentials.js, which will be ignored by Git
    2. replace the dummy values with your actual keys


    These keys are NOT used by:
    - the frontend app, which relies on your MetaMask to obtain provider and signer
    - CLI demo or tests if you run them on in-memory blockchain, which is the default Hardhat behavior

    These keys are used only when you explicitly request to run CLI demo or tests on an external network, e.g.:

    npx hardhat run ./scripts/refunder-demo.js --network ropsten
    npx hardhat test ./test/refunder.test.js --network rinkeby

*/

module.exports = {
    // add only the API keys for the services you are planning to use, ignore the rest
    INFURA_API_KEY: '000000000000000000000000000000',
    ALCHEMY_API_KEY: '1111111111111111111111111111111',
    ETHERSCAN_API_KEY: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',

    // one private key is enough, but you can add as many as you want
    PRIVATE_KEYS: [
        '0x1111111111111111111111111111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222222222222222222222222222',
    ],
}