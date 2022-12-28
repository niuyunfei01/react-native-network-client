//实例化socket对象
let url = `wss://wpush.meituan.com/websocket/2717_WMOPEN/wo2717tc_ZdjmKvdGMp3drXjqT72zX16AXgMgyq3qcWN4_BQg`
let io = new WebSocket(url)

export function connectSocket() {
  io.onopen(data => {   //用户进入时触发
    return console.log(data, "连接已建立")
  });
}

export function receiveSocket() {
  io.onmessage(data => {   //接收到消息是触发
    return console.log(data, "接收到消息")
  });
}

export function errorSocket() {
  io.onerror(error => {   //接收到消息是触发
    return console.log(error, "链接发生错误")
  });
}

export function closeSocket() {
  io.onclose(data => {    //用以区分是当前用户发送消息或其他用户
    return console.log('close 关闭连接', data)
  });
}

export function listenSocket() {
  io.addEventListener('message', data => {
    console.log('Listener data', data)
  })
}
