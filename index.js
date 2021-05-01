const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mysql = require('mysql2')

const jwt = require('jsonwebtoken')

const argon = require('argon2')

const auth = require('./auth.js')
//Set up database connection
const AuthObj = new auth();


//API requests
app.get('/', (req, res) => {
    res.json("Hello!");
});

app.post('/register', (req, res) => {
    let {user, pass} = req.body;

    //Check if user and or pass are undefined
    if(user == undefined || pass == undefined) {
        res.status(500).send("Server error, account not created");
        return;
    }

    //Make sure password length is greater than 0
    if(pass.length > 0) {
            AuthObj.register_account(user, pass).then(value => {
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
       let key = AuthObj.check_password(user, pass).then(value => {
           res.header('Access-Control-Expose-Headers', 'Authorization')
           res.set('Authorization', value)
           res.json("user and pass accepted");
       }, error => {
           if(error == "invalid username or password") {
               res.status(400).send("invalid username or password")
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


const port = process.env.PORT || 80;


app.listen(port, () => {
    console.log('Example app listening on port: ' + port);
})