const express = require("express")
const app = express()

const bodyParser = require("body-parser")
const axios = require("axios")

var HDWallet = require("./method/doing")

const Web3 = require("web3")
const web3 = new Web3("wss://ropsten.infura.io/ws");

var confirmCount = 0;

app.use('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(process.env.PORT || 3000)

var mainAddress = "0xb4200db8874aB862C79887Bc2E1376eABF7C03A4".toLowerCase()
var subAddress1 = "0xdF68f43EF66cd0ab093069DC2334EEb50F7219B9".toLowerCase()
var subAddress12 = "0xdd6D27e773C9ff3d07FE66ce5817D6Fa46660A03".toLowerCase()

var listAddress = [subAddress1, subAddress12]
var lastestBlock = 111

// bắt sự kiện có một block mới
var subscription = web3.eth.subscribe('newBlockHeaders', function (error, result) {
    if (error) {
        console.log(error);
    }
}).on("data", function (blockHeader) {
    // console.log("block moi nhat: ", blockHeader.number);
    lastestBlock = blockHeader.number
    web3.eth.getBlockTransactionCount(blockHeader.number - confirmCount)
        .then(count => {
            for (let i = 0; i < count; i++) {
                web3.eth.getTransactionFromBlock(blockHeader.number - confirmCount, i)
                    .then(trans => {
                        if (trans.to && listAddress.includes(trans.to.toLowerCase())) {

                            // console.log("block thay: ", blockHeader.number - confirmCount, "\nTxHas: ", trans.hash, "\nvalue: ", trans.value)
                            axios({
                                url: "https://demo.bitxmen.net/api/addr/test_deposit_eth.php",
                                method: 'POST',
                                data: {
                                    address: trans.to,
                                    value: web3.utils.fromWei(trans.value, "ether"),
                                    hash: trans.hash,
                                    coin: 'ETH'
                                }
                            })

                        }
                    })

                // .then(trans => {
                //     if(trans.to){
                //         console.log(trans.to)
                //     }
                // })
            }
        })
}).on("error", function (err) {
    console.log("xay ra loi: ", err)
});

app.get("/", (req, res) => {
    res.json({ listAddr: listAddress, lastestBlock: lastestBlock })
})

var seedroot = "xinchaocacbannha"
var pathroot = "m/44/60/0/"

app.post("/generate", (req, res) => {
    //let mail = req.body.mail
    //let user_id = req.body.user_id
    //let coin = req.body.coin



    //let seed = `${seedroot}${mail}${coin}`
    //let path = `${pathroot}${user_id}`

    let seed = req.body.seed
    let path = req.body.path

    //tao ra dia chi vi + private
    let add = HDWallet.createAddress(seed, path)
    let { generate_address, priKey } = add

    //them vao danh sach cac dia chi de duyet
    listAddress.push(generate_address.toLowerCase())


    res.json({ address: generate_address })

    //tra thong tin ve cho api
    // axios({
    //     // url: "https://demo.bitxmen.net/api/addr/test_generate.php",
    //     url: "https://demo.bitxmen.net/api/addr/test_generate.php",
    //     method: 'POST',
    //     data: {
    //         address: generate_address,
    //         privatekey: priKey,
    //         mem_id: user_id
    //     }
    // }).then(x => {
    //     res.end()
    // }).catch(x => {
    //     console.log(x)
    //     res.end()
    // })
})

app.get("/generate", (req, res) => {
    //let mail = req.body.mail
    //let user_id = req.body.user_id
    //let coin = req.body.coin



    //let seed = `${seedroot}${mail}${coin}`
    //let path = `${pathroot}${user_id}`

    let seed = req.query.seed
    let path = req.query.path
    let coin = req.query.coin

    if (!seed || !path || !coin) {
        res.send("tính hack ah?")
        res.end()
        return
    }
    //tao ra dia chi vi + private
    switch (coin) {
        case 'eth':
            let add = HDWallet.createAddress(seed, path)
            let { generate_address, priKey } = add

            //them vao danh sach cac dia chi de duyet
            listAddress.push(generate_address.toLowerCase())


            res.json({ address: generate_address })
            break

        case 'doge':
            break
    }


    //tra thong tin ve cho api
    axios({
        // url: "https://demo.bitxmen.net/api/addr/test_generate.php",
        url: "https://demo.bitxmen.net/api/addr/test_generate.php",
        method: 'POST',
        data: {
            address: generate_address,
            privatekey: priKey,
            mem_id: user_id
        }
    }).then(x => {
        res.end()
    }).catch(x => {
        console.log(x)
        res.end()
    })
})

app.get("/clearlist", (req, res) => {
    listAddress = [subAddress1, subAddress12]
    res.send("clear thanh cong")
    res.end()
})