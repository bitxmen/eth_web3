const HDWallet = require("ethereumjs-wallet")
const HDKey = require("hdkey")


function createAddress(seed, path){
    var hdkey = HDKey.fromMasterSeed(Buffer.from(seed))
    var childkey = hdkey.derive(path)
    var extPriKey = childkey.privateExtendedKey

    var hdwallet = HDWallet.fromExtendedPrivateKey(extPriKey)
    var generate_address = '0x' + hdwallet.getAddress().toString("hex")
    var priKey = hdwallet.getPrivateKey().toString("hex")

    var generated = {
        generate_address: generate_address,
        priKey: priKey
    }
    return generated
}

module.exports = {
    createAddress
}