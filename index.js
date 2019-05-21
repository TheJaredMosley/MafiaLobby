var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');


app.use(express.static('public'));

var users = [];
var rooms = [];
var roles = ["Mafia Member", "Villager", "Villager", "Cop", "Doctor", "Mafia Member", "Villager", "Villager", "Villager", "Mafia Member", "Villager", "Villager", "Villager", "Mafia Member"];

app.get('/', function(req, res){
  res.sendFile(__dirname + '\\index.html');
});





http.listen(process.env.PORT || 80, function(){
  console.log('listening on *:3000');
});

var jsonobj = {
  "townsfolk": [
    {
      "name": "Chef",
      "team": "town",
      "img": "Chef_Token.png"
    },
    {
      "name": "Empath",
      "team": "town",
      "img": "Empath_Token.png"
    },
    {
      "name": "Investigator",
      "team": "town",
      "img": "Investigator_Token.png"
    },
    {
      "name": "Fortune Teller",
      "team": "town",
      "img": "Fortune_Teller_Token.png"
    },
    {
      "name": "Librarian",
      "team": "town",
      "img": "Librarian_Token.png"
    },
    {
      "name": "Mayor",
      "team": "town",
      "img": "Mayor_Token.png"
    },
    {
      "name": "Monk",
      "team": "town",
      "img": "Monk_Token.png"
    },
    {
      "name": "Ravenkeeper",
      "team": "town",
      "img": "Ravenkeeper_Token.png"
    },
    {
      "name": "Soldier",
      "team": "town",
      "img": "Soldier_Token.png"
    },
    {
      "name": "Slayer",
      "team": "town",
      "img": "Slayer_Token.png"
    },
    {
      "name": "Undertaker",
      "team": "town",
      "img": "Undertaker_Token.png"
    },
    {
      "name": "Washerwoman",
      "team": "town",
      "img": "Washerwoman_Token.png"
    }
  ],
  "minion": [
    {
      "name": "Baron",
      "team": "minion",
      "img": "Baron_Token.png"
    },
    {
      "name": "Poisoner",
      "team": "minion",
      "img": "Poisoner_Token.png"
    },
    {
      "name": "Scarlet Woman",
      "team": "minion",
      "img": "Scarlet_Woman_Token.png"
    },
    {
      "name": "Spy",
      "team": "minion",
      "img": "Spy_Token.png"
    }
  ],
  "outsider": [
    {
      "name": "Butler",
      "team": "outsider",
      "img": "Butler_Token.png"
    },
    {
      "name": "Drunk",
      "team": "outsider",
      "img": "Drunk_Token.png"
    },
    {
      "name": "Saint",
      "team": "outsider",
      "img": "Saint_Token.png"
    },
    {
      "name": "Recluse",
      "team": "outsider",
      "img": "Recluse_Token.png"
    }
  ],
  "demon": [
    {
      "name": "Imp",
      "team": "demon",
      "img": "Imp_Token.png"
    }
  ]
};

var setupNumbers = {
  '5': [3,0,1,1],
  '6': [3,1,1,1],
  '7': [5,0,1,1],
  '8': [5,1,1,1],
  '9': [5,2,1,1],
  '10': [7,0,2,1],
  '11': [7,1,2,1],
  '12': [7,2,2,1],
  '13': [9,0,3,1],
  '14': [9,1,3,1],
  '15': [9,2,3,1]
}

var numPlayers = 9;

var players = [];

var thisSetup

var selectedTown = [];
var selectedOut = [];
var selectedMinion = [];
var selectedDemon = [];
var drunkCharacter = [];

function setupPlayers(){
  for(i = 0; i < thisSetup[2]; i++){
    var ranNum = Math.floor(Math.random() * jsonobj["minion"].length);
    while(selectedMinion.includes(ranNum)){
      ranNum = Math.floor(Math.random() * jsonobj["minion"].length);
    }
    selectedMinion.push(ranNum);
    players.push(jsonobj["minion"][ranNum]);
    if(jsonobj["minion"][ranNum]["name"] == "Baron"){
      thisSetup[0] -= 2;
      thisSetup[1] += 2;
    }
   }
  
  for(i = 0; i < thisSetup[0]; i++){
    var ranNum = Math.floor(Math.random() * jsonobj["townsfolk"].length);
    while(selectedTown.includes(ranNum)){
      ranNum = Math.floor(Math.random() * jsonobj["townsfolk"].length);
    }
    selectedTown.push(ranNum);
    players.push(jsonobj["townsfolk"][ranNum]);
  }
  
  for(i = 0; i < thisSetup[1]; i++){
    var ranNum = Math.floor(Math.random() * jsonobj["outsider"].length);
    while(selectedOut.includes(ranNum)){
      ranNum = Math.floor(Math.random() * jsonobj["outsider"].length);
    }
    selectedOut.push(ranNum);
    if(jsonobj["outsider"][ranNum]["name"] == "Drunk"){
      var ranNum = Math.floor(Math.random() * jsonobj["townsfolk"].length);
      while(selectedTown.includes(ranNum)){
        ranNum = Math.floor(Math.random() * jsonobj["townsfolk"].length);
      }
      selectedTown.push(ranNum);
      players.push(jsonobj["townsfolk"][ranNum]);
      drunkCharacter = jsonobj["townsfolk"][ranNum];
    }
    else{
      players.push(jsonobj["outsider"][ranNum]);
    }
  }
    
    
  
  for(i = 0; i < thisSetup[3]; i++){
    var ranNum = Math.floor(Math.random() * jsonobj["demon"].length);
    while(selectedDemon.includes(ranNum)){
      ranNum = Math.floor(Math.random() * jsonobj["demon"].length);
    }
    selectedDemon.push(ranNum);
    players.push(jsonobj["demon"][ranNum]);
  }
  
  //console.log(players);
  //console.log(drunkCharacter);

}



io.on('connection', function(socket){
  //console.log('a user connected');

  socket.on('roomJoin', data => {
    socket.join(data.room);
    socket.name = data.name;
    socket.lobbyRoom = data.room;

    var clients = io.sockets.adapter.rooms[data.room].sockets;

    var localUsers = [];
    for (var client in clients){
      var clientSocket = io.sockets.connected[client];
      localUsers.push(clientSocket.name);
    }
    io.to(data.room).emit('updateRoom', localUsers);
    io.to(data.room).emit('updateRoomNumber', data.room);
  })

  socket.on('start', () => {

    var clients = io.sockets.adapter.rooms[socket.lobbyRoom].sockets;
    var num = Object.keys(clients).length;
    var cards = [];
    var rolenames = [];
    var grim = [];

    if(num < 5){
      num = 5;
    }
    thisSetup = setupNumbers[num];

    setupPlayers(); //this is where its breaking.
    
    for(var i = 0; i < players.length; i++){
      cards.push("/img/" + players[i].img);
      rolenames.push(players[i].name);
    }

  
    for (var client in clients){
      if(client == socket.id){
        
      }
      else{
        var clientSocket = io.sockets.connected[client];
        var cardIndex = Math.floor(Math.random() * cards.length);
        var card = cards[cardIndex];
        grim.push({name: clientSocket.name, role: rolenames[cardIndex]})
        cards.splice(cardIndex, 1);
        rolenames.splice(cardIndex, 1);
        io.to(client).emit('deal', card);
      }
      
    }

    io.to(socket.id).emit('dealhost', grim);

    players = [];
    selectedTown = [];
    selectedOut = [];
    selectedMinion = [];
    selectedDemon = [];
    drunkCharacter = [];

    console.log(grim);


  });
});