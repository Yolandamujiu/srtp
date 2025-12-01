import socket

sock=socket.socket()

sock.bind(("127.0.0.1",8080))#绑定，这个服务器只接受来自本机内部的连接
sock.listen(5)
while 1:#阻塞式调用
    conn,addr = sock.accept() #返回一个元组（管道和地址）
    data = conn.recv(1024)#一次性接收的最大字节数
    print("客户端发送的响应信息：\n",data)
    
    conn.send(b"HTTP/1.1 200 ok\r\nserver:yuan\r\n\r\nhello world")#符合http协议的字符串，包含响应行，响应头和响应体
    conn.close()