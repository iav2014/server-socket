# server-socket
a socket.io server socket prepare for scaling up 1.000 k users

This is a example socket.io server (1.3.5 version).
This server using redis for scale, and enable to send broadcast message to all clients connected.
Controller.js are the master process. It launch several server listen from 8500 port to 85XX port.
This server has tested at production second screen systems.
The server managed  5000 clients / port, 200K user for host (CentOs 6, and 8 cores, 15 GB ram).
There are several ways to communicate between process (process class, rest methods and socket.io-emmiter redis way)
localhost:3000/load presents status conenctions
localhost:3000/process presents cluster status
localhost:/send:message send message to all clients.

Remember install redis store !!

Balancing socket.io with haproxy
You can balance connections at different ports at the same host, using haproxy.
The number maxconn parameter at server entry, limit the number of sockets connection at the same port.
You must fit this value according you host parameters.
All sockets at 80 port will be redirect at 8500 .. 85XX socket.io ports.

SYSCTL - kernel parameters
Net kernel parameter must be increased to allow high level open process and open sockets.
net.core.somaxconn = 3240000
net.core.wmem_max = 25165824
net.core.rmem_max = 25165824
net.core.wmem_default = 124928
net.core.rmem_default = 124928
