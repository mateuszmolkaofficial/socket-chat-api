const express = require('express')
const app = express()
const PORT = 8000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const configDB = require('./config/database');
const router = express.Router();

const Message = require('./models/Message');

// API's
const auth = require('./auth/auth');

mongoose.connect(configDB.url);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use('/api/auth', auth);

var socket = require('socket.io');


const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

io = socket(server);

io.on('connection', (socket) => {
  socket.on('SEND_MESSAGE', message => {
    const newMessage = new Message();

    // set the user's credentials
    newMessage.author = message.author;
    newMessage.text = message.text;
    newMessage.timestamp = message.timestamp;
    // save the user
    newMessage.save();
  })

  socket.on('GET_ALL_MESSAGES', () => {
    Message.find({}, (err, messages) => {
      io.emit('RETURN_ALL_MESSAGES', messages);
    })
  })

});