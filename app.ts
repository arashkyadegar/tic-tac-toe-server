var http=require('http');
var express = require('express');
import jwt from 'jsonwebtoken';
const bodyParser = require("body-parser");
import dotenv from 'dotenv';
import { UserEntity } from './models/entities';

dotenv.config();


export var app = express();
var http = require('http').Server(app);
const cors = require('cors');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: '*'
}));

//Error handling
app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  res.status(status).send(`error : ${err.message}`);
})



app.post('/login', (req: any, res: any,next: any) => {

      const name =  req.body.name;
      const pass =  req.body.password;
      const rememberUser = req.body.remember;

      const token = jwt.sign({ user_id: "",email:name },
        (<string>process.env.TOKEN),  ///temprory TOKEN_KEY
        {expiresIn: "2h"}
        );

      res.status(200).send({
        user : name,
        token : token
      });

})

app.use(express.json());

const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});


io.use((socket: any, next: any) => {
        try{
          const token = socket.handshake.query.token;
          if(jwt.verify(token,<string>process.env.TOKEN)) {
            next();
          }
        }catch(err: any) {
          console.log('error ==>');
          console.log(err.message);
          next();
        }
});


io.on('connection' , async (socket: any) => {
  const characters ="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let socketsArray: string[] = [];
  const sockets = await io.fetchSockets();

  sockets.forEach((element: any) => 
      socketsArray.push(element.id)
  );

  let x = characters.charAt(Math.floor(Math.floor(Math.random() * 10)));

  if(io.sockets.adapter.rooms.get("GameRoom") == undefined) {
    socket.join("GameRoom");
    socket.emit('JoinGame',{message: "you joined the room",status:true ,token :x});
  }else{
    const room = io.sockets.adapter.rooms.get("GameRoom");
    if(room.size < 2) {
      socket.join("GameRoom");
      socket.emit('JoinGame',{message: "you joined the room",status:true,token :x });
    }else{
      socket.emit('JoinGame',{message: "you cant join the room",status:false});
    }
  }



  socket.on('SendPlayerMoveRequest', (message: any) => {
    socket.broadcast.emit('SendPlayerMoveReply',{
      message: message
    });
  })

  socket.on('disconnect', (socket: any) => {
  });

  socket.on('connect_failed', function() {
    console.log("Sorry, there seems to be an issue with the connection!");
  })
});


http.listen(process.env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
});

module.exports = app;


