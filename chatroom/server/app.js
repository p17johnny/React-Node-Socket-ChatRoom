const express = require('express')
const app = express()
var admin = require("firebase-admin");
var serviceAccount = require("./key.json");
var cors = require('cors')
app.use(cors({credentials: true, origin: true}))
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatroomrnsf.firebaseio.com"
});


//將 express 放進 http 中開啟 Server 的 9000 port ，正確開啟後會在 console 中印出訊息
const server = require('http').Server(app)
    .listen(9000,()=>{console.log('open server!')})

var fireData = admin.database();

app.get('/getHistory',function(req,res){
    var message;
    fireData.ref('chatroom/messages').on('value',function(snapshot){
        message = snapshot.val();
    }).then(
        console.log(message),
        res.send(message)
    )
    
})


const io = require('socket.io')(server)

io.on('connection', socket => {
    //經過連線後在 console 中印出訊息
    console.log('連接成功!')

     /*只回傳給發送訊息的 client*/
    socket.on('getMsg', message => {
        socket.emit('getMsg', message)
        console.log("已傳送給自己: ",message)
    })

    /*回傳給所有連結著的 client*/
    socket.on('getMsgAll', message => {
        io.sockets.emit('getMsgAll', message)
        fireData.ref('chatroom/messages').push({
            name:message.name,
            msg:message.msg
        })
        console.log("已傳送給所有人: ",message)
    })

    /*回傳給除了發送者外所有連結著的 client*/
    socket.on('getMsgN', message => {
        socket.broadcast.emit('getMsgN', message)
        console.log("已傳送給其他人: ",message)
    })

   
})

