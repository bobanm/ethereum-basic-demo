function generateInfuraUrl (networkName, apiKey) {

    return `https://${networkName}.infura.io/v3/${apiKey}`
}

function generateAlchemyUrl (networkName, apiKey) {

    return `https://eth-${networkName}.alchemyapi.io/v2/${apiKey}`
}

module.exports = { generateInfuraUrl, generateAlchemyUrl }