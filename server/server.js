const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require('path');
app.use(express.static(path.resolve(__dirname, '../client/build')));

const http = require('http');

const mysql = require('mysql2');

const jwt = require('jsonwebtoken');

const argon = require('argon2');

const auth = require('./auth.js');
const RoomsObj = require('./gameRoom.js');
//Set up database connection
const AuthObj = new auth();
const Rooms = new RoomsObj();

//API requests
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.post('/register', (req, res) => {
    let {user, pass} = req.body;
    console.log("register")
    //Check if user and or pass are undefined
    if(user == undefined || pass == undefined) {
        console.log("user")
        console.log("pass")
        res.status(500).send("Server error, account not created");
        return;
    }

    //Make sure password length is greater than 0
    if(pass.length > 0) {
            AuthObj.register_account(user.toLowerCase(), pass).then(value => {
                res.send("Thank you for registering!")
            }).catch(function(e) {
                console.log(e)
                if(e.code == "ER_DUP_ENTRY") {
                    res.status(422).send("Username already exists!")
                } else {
                    res.status(500).send("Sever error, account not created");
                }
        });
    }
});
app.post('/login', (req, res) => {
    let {user, pass} = req.body;
    console.log(req.body);

    //Check if user and or pass are undefined
    if(user == undefined || pass == undefined) {
        res.status(500).send("Server error, could not log in");
        return;
    }

    //Make sure password length is greater than 0
    if(pass.length > 0) {
       AuthObj.check_password(user.toLowerCase(), pass).then(value => {
           res.header('Access-Control-Expose-Headers', 'Authorization')
           res.set('Authorization', value)
           res.json("user and pass accepted");
       }, error => {
           if(error == "Unauthorized") {
               res.status(401).send("Unauthorized")
           } else {
               res.status(500).send("Server error, could not log in")
           }
       })
    }
})

app.post('/verify', (req, res) => {
    let token = req.headers.authorization
    console.log(token);
    if(token == undefined) {
        res.status(400).send("Invalid token")
    }

    if(AuthObj.verify_account(token)) {
        res.send("Welcome back!")
    }
})

app.get('/createRoom', (req, res) => {
    let token = req.headers.authorization
    if(token == undefined || !AuthObj.verify_account(token)) {
        res.status(401).send("Unauthorized")
    }
    let code = Rooms.newRoom(AuthObj.getSong.bind(AuthObj));
    res.json({code: code});
})


app.post('/joinGame', async function(req, res) {
    let token = req.headers.authorization
    // console.log(token);
    // console.log(req);
    if(token == undefined || !AuthObj.verify_account(token)) {
        res.status(401).send("Unauthorized")
    }

    let user = jwt.decode(token).user;
    let code = req.body.code;

    try{
        if(Rooms.isOpen(code, user)) {
            res.send("OK")
        }
    } catch (error) {
        console.log(error);
        if(error.message === "Does not exist") {
            res.status(422).send("Does not exist");
        } else if (error.message === "Room full") {
            res.status(422).send("Room full");
        } else {
            res.status(400).send();
        }
    }
    
})

app.get('/establishConnection*', async function(req, res) {
    let code = req.url.substr(21, 5);
    console.log(code)
    let token = req.url.substr(27);
    console.log(token)
    console.log(req.url)
    if(token == undefined || !AuthObj.verify_account(token)) {
        res.status(401).send("Unauthorized")
    }
    let user = jwt.decode(token).user;
    res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    res.flushHeaders()
    res.write('retry: 10000\n\n');
    Rooms.join(code, user, (message) => {
        res.write(message);
    })
})

app.post('/startGame', (req, res) => {
    let token = req.headers.authorization
    if(token == undefined || !AuthObj.verify_account(token)) {
        res.status(401).send("Unauthorized")
    }
    let user = jwt.decode(token).user;
    let code = req.body.code;
    Rooms.rooms[code].start();
    res.send("OK");

})

app.post('/submit', (req, res) => {
    let token = req.headers.authorization
    if(token == undefined || !AuthObj.verify_account(token)) {
        res.status(401).send("Unauthorized")
    }
    let user = jwt.decode(token).user;
    let code = req.body.code;
    let answer = req.body.answer;
    if(answer != undefined) {
        Rooms.rooms[code].submit(user, answer);
    }
    res.send("OK");

})

const port = process.env.PORT || 80;


app.listen(port, () => {
    console.log('server listening on port: ' + port);
})