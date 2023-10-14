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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bodyParser = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.app = express();
var http = require('http').Server(exports.app);
const cors = require('cors');
exports.app.use(bodyParser.json());
exports.app.use(bodyParser.urlencoded({ extended: false }));
exports.app.use(cors({
    origin: '*'
}));
//Error handling
exports.app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).send(`error : ${err.message}`);
});
exports.app.post('/login', (req, res, next) => {
    const name = req.body.name;
    const pass = req.body.password;
    const rememberUser = req.body.remember;
    const token = jsonwebtoken_1.default.sign({ user_id: "", email: name }, process.env.TOKEN, ///temprory TOKEN_KEY
    { expiresIn: "2h" });
    res.status(200).send({
        user: name,
        token: token
    });
});
exports.app.use(express.json());
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
io.use((socket, next) => {
    try {
        const token = socket.handshake.query.token;
        if (jsonwebtoken_1.default.verify(token, process.env.TOKEN)) {
            next();
        }
    }
    catch (err) {
        console.log('error ==>');
        console.log(err.message);
        next();
    }
});
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let socketsArray = [];
    const sockets = yield io.fetchSockets();
    sockets.forEach((element) => socketsArray.push(element.id));
    let x = characters.charAt(Math.floor(Math.floor(Math.random() * 10)));
    if (io.sockets.adapter.rooms.get("GameRoom") == undefined) {
        socket.join("GameRoom");
        socket.emit('JoinGame', { message: "you joined the room", status: true, token: x });
    }
    else {
        const room = io.sockets.adapter.rooms.get("GameRoom");
        if (room.size < 2) {
            socket.join("GameRoom");
            socket.emit('JoinGame', { message: "you joined the room", status: true, token: x });
        }
        else {
            socket.emit('JoinGame', { message: "you cant join the room", status: false });
        }
    }
    socket.on('SendPlayerMoveRequest', (message) => {
        socket.broadcast.emit('SendPlayerMoveReply', {
            message: message
        });
    });
    socket.on('disconnect', (socket) => {
    });
    socket.on('connect_failed', function () {
        console.log("Sorry, there seems to be an issue with the connection!");
    });
}));
http.listen(process.env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
});
module.exports = exports.app;
