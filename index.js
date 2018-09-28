const express = require("express")
const app = express()

const http = require("http")
var socketIO = require("socket.io")
var server = http.Server(app)
var io = socketIO(server)
server.listen(process.env.PORT || 3000)

const bodyParser = require("body-parser")
const axios = require("axios")

var HDWallet = require("./method/doing")

const Web3 = require("web3")
const web3 = new Web3("wss://ropsten.infura.io/ws");



app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static('public'))

app.use('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


var mainAddress = "0xb4200db8874aB862C79887Bc2E1376eABF7C03A4".toLowerCase()
var subAddress1 = "0xdF68f43EF66cd0ab093069DC2334EEb50F7219B9".toLowerCase()
var subAddress12 = "0xdd6D27e773C9ff3d07FE66ce5817D6Fa46660A03".toLowerCase()

var listAddress = [subAddress1, subAddress12]
var lastestBlock = 111
var lastestTransFound = "chua tim thay"
var confirmCount = 0;

// bắt sự kiện có một block mới
var subscription = web3.eth.subscribe('newBlockHeaders', function (error, result) {
    if (error) {
        console.log(error);
    }
}).on("data", function (blockHeader) {
    // console.log("block moi nhat: ", blockHeader.number);
    lastestBlock = blockHeader.number
    io.sockets.emit("NEW_BLOCK", {
        list: listAddress,
        lastestBlock: lastestBlock,
        lastestTransFound: lastestTransFound
    });
    web3.eth.getBlockTransactionCount(blockHeader.number - confirmCount).then(count => {
        for (var i = 0; i < count; i++) {
            web3.eth.getTransactionFromBlock(blockHeader.number - confirmCount, i).then(trans => {

                // if(trans.to != null){
                //     console.log(blockHeader.number, " --- ", trans.to.toLowerCase());
                    
                // }

                if (trans.to != null && listAddress.indexOf(trans.to.toLowerCase()) > -1) {
                    lastestTransFound = trans.hash

                    axios({
                        url: "https://demo.bitxmen.net/api/addr/test_deposit_eth.php",
                        method: 'POST',
                        data: {
                            address: trans.to,
                            value: web3.utils.fromWei(trans.value, "ether"),
                            hash: trans.hash,
                            coin: 'ETH'
                        }
                    }).then(() => {
                        io.sockets.emit("NEW_BLOCK", {
                            list: listAddress,
                            lastestBlock: lastestBlock,
                            lastestTransFound: trans.hash
                        });
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
    // console.log("-------------------------------");

}).on("error", function (err) {
    console.log("xay ra loi: ", err)
});

app.get("/", (req, res) => {
    res.render("index", { content: { list: listAddress, lastestBlock: lastestBlock, lastestTransFound: lastestTransFound } })
})

// var seedroot = "xinchaocacbannha"
// var pathroot = "m/44/60/0/"


app.get("/generate", (req, res) => {
    //var mail = req.body.mail
    //var user_id = req.body.user_id
    //var coin = req.body.coin

    //var seed = `${seedroot}${mail}${coin}`
    //var path = `${pathroot}${user_id}`

    var seed = req.query.seed
    var path = req.query.path
    var coin = req.query.coin

    if (!seed || !path || !coin) {
        res.send("tính hack ah?")
        res.end()
        return
    }
    //tao ra dia chi vi + private
    switch (coin) {
        case 'eth':
            var add = HDWallet.createAddress(seed, path)
            var { generate_address, priKey } = add

            //them vao danh sach cac dia chi de duyet
            listAddress.push(generate_address.toLowerCase())


            res.json({ address: generate_address })
            break

        case 'doge':
            break
    }


    //tra thong tin ve cho api
    // axios({
    //     // url: "https://demo.bitxmen.net/api/addr/test_generate.php",
    //     url: "https://demo.bitxmen.net/api/addr/test_generate.php",
    //     method: 'POST',
    //     data: {
    //         address: generate_address,
    //         privatekey: 'keytoandeptrai',
    //         mem_id: 123
    //     }
    // }).then(x => {
    //     res.end()
    // }).catch(x => {
    //     console.log(x)
    //     res.end()
    // })
})

app.get("/clearlist", (req, res) => {
    listAddress = [subAddress1, subAddress12]
    res.send("clear thanh cong")
    res.end()
})