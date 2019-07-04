const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);



//DB
const dbUrl = 'mongodb+srv://admin:admin@cluster0-tvf4f.mongodb.net/sockets';

mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) => {
   if(err) console.log("Err with db connection", err);
   console.log("DB is connected.");
});
const Message = mongoose.model('Message', { name: String, message: String, socketId: String });


//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname));

//Routes
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        if(err) console.log('Err with GET request to the /messages', err);
        res.send(messages);
    });
})

app.post('/messages', (req, res) => {
    const message = new Message(req.body);
    message.save((err) => {
        if (err) {
            console.log('Error for record creation -> ', err);
            res.sendStatus(500);
        }
        //Send message to the client
        io.emit('message',req.body);
        res.sendStatus(200);
    });
});

server.listen(8000, () => {
    console.log('Server is running on port', server.address().port);
});


//Socket.io
io.on('connection', (socket) => {
    console.log('User connected with id ->', socket.id);
    socket.on('disconnect',function () {
        console.log('User is gone. with id ->', socket.id);
    })
})
