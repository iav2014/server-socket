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

Node js command parameters:
This node js parameter are taken from 600k-concurrent-websocket-connections-on-aws-using-node-js article.

node --nouse-idle-notification--expose-gc--max-new-space-size=2048--max-old-space-size=8192 controller.js
–nouse-idle-notification
Turns of the idle garbage collection which makes the GC constantly run and is devastating for a realtime server environment.
If not turned off the system will get a long hickup for almost a second once every few seconds.
–expose-gc
Use the expose-gc command to enable manual control of the GC from your code.
–max-old-space-size=8192
Increases the limit for each V8 node process to use max 8Gb of heap memory instead of the 1,4Gb
default on 64-bit machines(512Mb on a 32-bit machine).
–max-new-space-size=2048
Specified in kb and setting this flag optimizes the V8 for a stable allround environment with short pauses and
ok high peak performance.
If this flag is not used the pauses will be a little bit longer but the machine will handle peaks a little bit better.
What you need in this case depends on the project you are working on. My pick is to have an allround stable server instead
of just handling peaks so I stick with this flag.

Forever
if you are using a forever calling,

forever start controller.js --nouse-idle-notification--expose-gc--max-new-space-size=2048--max-old-space-size=8192
