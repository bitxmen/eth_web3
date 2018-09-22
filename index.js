const express = require("express")
const app = express()

const bodyParser = require("body-parser")
const axios = require("axios")

const HDWallet = require("ethereumjs-wallet")
const HDKey = require("hdkey")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.set("Access-Control-Allow-Origin", "'https://demo.bitxmen.net")

app.listen(3000 || process.env.PORT)
var mail = "toan_nguyen@gmail.com"
var id = 2
var seed = `bitxmen${mail}`
var path = `m/44/60/0/${id}`
var hdkey = HDKey.fromMasterSeed(Buffer.from(seed))
var childkey = hdkey.derive(path)

var extPriKey = childkey.privateExtendedKey
var extPubKey = childkey.publicExtendedKey

// console.log("seed => hdkey (derive) => childkey => childkey privateExtended key => address + private key")
// console.log("seed = bitxmen + mail of member,", "derive path = m/44/60/0/ + id of member")


// console.log("ext private key    :", extPriKey)
// console.log("ext public key     :", extPubKey)


var hdwallet = HDWallet.fromExtendedPrivateKey(extPriKey)
var address = hdwallet.getAddress() // địa chỉ ví
var priKey = hdwallet.getPrivateKey() //mật khẩu
var pubKey = hdwallet.getPublicKey()

console.log("address            :", '0x' + address.toString("hex"))
console.log("wall-private key   :", priKey.toString("hex"))

app.get("/", (req, res) => {
    res.end("ok ne")
})

app.post("/address", (req, res) => {
    let mail = req.body.mail
    let user_id = req.body.user_id

    console.log(mail, user_id)
    axios({
        url: "https://demo.bitxmen.net/api/test_wallet.php",
        method: 'POST',
        data: {
            address: '0x1234asda65sd456as4df',
            privatekey: 'djkgfdf6545343fgh3'
        }
    }).then(x => {
        res.send("thanh cong")
        res.end()
    }).catch(x => {
        console.log(x)
        res.end()
    })
})