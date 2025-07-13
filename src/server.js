require('dotenv/config')

const express = require('express');
const configViewEngine = require('./config/configEngine');
const routes  = require('./routes/web');
const cronJobContronler = require('./controllers/cronJobContronler');
const socketIoController = require('./controllers/socketIoController');
const aviatorController = require('./controllers/aviatorController');


let cookieParser = require('cookie-parser');
require('dotenv').config({path:'../.env'});

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 7777;

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut 
cronJobContronler.cronJobGame1p(io);

// Check xem ai connect vào sever 
socketIoController.sendMessageAdmin(io);

aviatorController.Aviator(io);



// app.all('*', (req, res) => {
//     return res.render("404.ejs"); 
// });





server.listen(port, () => {
    console.log("Connected success port: " + port);
});

