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
This is my haproxy.conf file, you can use this conf like example:

-- start conf --
global
   log         127.0.0.1 local2

   chroot      /var/lib/haproxy
   pidfile     /var/run/haproxy.pid
   user        haproxy
   group       haproxy
   daemon

   stats socket /var/lib/haproxy/stats

defaults
   log                     global
   option                  dontlognull
   option                  redispatch
   retries                 2
   timeout queue           1m
   timeout connect         10s
   timeout client          1m
   timeout server          1m
   timeout check           10s
# all entry connections socket.io at 80 port will be redirect to 8500 .. 85XX local ports
frontend  localnodes
   bind *:80
   mode tcp
   log global
   option tcplog
   maxconn  80
   default_backend             app
# change localhost for your haproxy ip, 8500 .. 85XX server sockets.io ports
# maxconn define limit connections / ports
backend app
   mode tcp
   balance     source
   option      tcplog
   server  app1 localhost:8500 maxconn 5000
   server  app2 localhost:8501 maxconn 5000

listen stats *:1936
   mode http
   stats enable
   stats uri /
   stats hide-version
   stats auth admin:admin

-- conf end