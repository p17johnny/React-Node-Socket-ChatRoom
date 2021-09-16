import React , { useState, useEffect } from 'react';
import webSocket from 'socket.io-client'
import axios from 'axios';


function App() {
  const [ws,setWs] = useState(null)
  const [name,setName] = useState('');
  const [msg,setMsg] = useState('');
  const [messages,setMessages] = useState([]);

  const connectWebSocket = () => {
    setWs(webSocket('http://localhost:9000'))
  }

  useEffect(()=>{
      connectWebSocket();

      loadMsg();
        
  },[])
  
  async function loadMsg(){
    const response = await axios.get("http://127.0.0.1:9000/getHistory", { headers: {'Content-Type': 'application/json'}})
    const getData = response.data;
    const data = Object.keys(getData).map(key => getData[key]);
    console.log(data);
  }

  useEffect(()=>{
      if(ws){
        //連線成功在 console 中打印訊息
        console.log('連接成功');
        //設定監聽
        initWebSocket();
      }
  },[ws])

  const initWebSocket = () => {
      
    ws.on('getMsg', message  => {
        console.log('自己收到, ',message.name,': ',message.msg)
    })
    ws.on('getMsgAll', message  => {
        console.log('大家收到, ',message.name,': ',message.msg)
    })
    ws.on('getMsgN', message  => {
        console.log('除了他收到, ',message.name,': ',message.msg)
    })
      
  }

  const sendMsg = (type) => {
    var detail = {
        name:name,
        msg:msg
    }
    ws.emit(type,detail);
  }

  return (
    <div>
        <div>
            <input type="text" placeholder="您的名字" onChange={event => setName(event.target.value)}></input>
            <input type="text" placeholder="輸入訊息" onChange={event => setMsg(event.target.value)}></input>
        </div>

      

		<button onClick={()=> sendMsg('getMsg')}>傳給自己</button>
        <button onClick={()=> sendMsg('getMsgAll')}>傳給所有人</button>
		<button onClick={()=> sendMsg('getMsgN')}>傳給除了自己以外的人</button>
			
    </div>
  );
}

export default App;