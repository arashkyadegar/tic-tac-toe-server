var http=require('http');
var express = require('express');

const bodyParser = require("body-parser");
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT;
const socketPort = process.env.SOCKETPORT;
export var app = express();
var http = require('http').Server(app);

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//allow to call from local angular
app.use(function(req: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

app.use(express.json());
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});


io.on('connection' , (socket: any) => {

    socket.on('OnlineClientListRequest',async  () => {
      let socketsArray: string[] = [];
      const sockets = await io.fetchSockets();
      sockets.forEach((element: any) => 
          socketsArray.push(element.id)
      );
      socket.emit('OnlineClientListRequest',
            {
              socketsArray: socketsArray
            }
      )
    });


    socket.on('privateMessage', (message: any) => {
      console.log(message);
      socket.to(message.reciever)
      .emit('privateMessage',
            {
              senderId: socket.id ,
              message: message.message 
            }
      )
    })
  //  socket.on('message', (message) => {
  //   console.log(`message from  ${socket.id} : ${message}`);
  //   socket.broadcast.emit('message',{
  //     senderId : socket.id,
  //     message : message
  //   });
  //  })
   //socket.on('broad',{ description:  `${clients} clients connected!`});
   socket.on('disconnect', (socket: any) => {
  
   });
});


//error catching middleware

app.use((err: any, req: any, res: any, next: any) => {
  const status = err.status || 500;
  res.status(status).send(`error : ${err.message}`);
})

http.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

module.exports = app;
