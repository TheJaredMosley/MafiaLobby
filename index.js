var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var users = [];
var rooms = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '\\index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  //console.log('a user connected');

  socket.on('roomJoin', data => {
    socket.join(data.room);
    socket.name = data.name;

    var clients = io.sockets.adapter.rooms[data.room].sockets;

    var localUsers = [];
    for (var client in clients){
      var clientSocket = io.sockets.connected[client];
      localUsers.push(clientSocket.name);
    }

    console.log(localUsers);
    io.to(data.room).emit('updateRoom', localUsers);


  })
});