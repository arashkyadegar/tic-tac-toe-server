"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var http = require('http');
var express = require('express');
const bodyParser = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT;
const socketPort = process.env.SOCKETPORT;
exports.app = express();
var http = require('http').Server(exports.app);
// parse application/json
exports.app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
exports.app.use(bodyParser.urlencoded({ extended: false }));
//allow to call from local angular
exports.app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
exports.app.use(express.json());
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
io.on('connection', (socket) => {
    socket.on('OnlineClientListRequest', () => __awaiter(void 0, void 0, void 0, function* () {
        let socketsArray = [];
        const sockets = yield io.fetchSockets();
        sockets.forEach((element) => socketsArray.push(element.id));
        socket.emit('OnlineClientListRequest', {
            socketsArray: socketsArray
        });
    }));
    socket.on('privateMessage', (message) => {
        console.log(message);
        socket.to(message.reciever)
            .emit('privateMessage', {
            senderId: socket.id,
            message: message.message
        });
    });
    //  socket.on('message', (message) => {
    //   console.log(`message from  ${socket.id} : ${message}`);
    //   socket.broadcast.emit('message',{
    //     senderId : socket.id,
    //     message : message
    //   });
    //  })
    //socket.on('broad',{ description:  `${clients} clients connected!`});
    socket.on('disconnect', (socket) => {
    });
});
//error catching middleware
exports.app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(`error : ${err.message}`);
});
http.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
module.exports = exports.app;
