const jwt = require('jsonwebtoken')

const argon = require('argon2')

const axios = require('axios')

const mysql = require('mysql2')



module.exports = class AuthObj {
    constructor() {

        this.connection = mysql.createConnection({
            host: 'us-cdbr-east-03.cleardb.com',
            user: 'bb43b481ba0010',
            password: '8f3c0359',
            database: 'heroku_08c0b6889d72a7b'
        })
        try {
            this.connection.connect()
        } catch(error) {
            console.log(error)
        }
        this.secretKey = "Mi*7N3D4k@&,4Dkl)98MdKj*7%nMQ3Tf"
    };


    check_password = async function(user, pass) {
        await this.connection.promise().query('USE users;')
        let results = await this.connection.promise().query('SELECT pass FROM userdata WHERE username = ?', [user])
        let verified = await argon.verify(results[0][0]['pass'], pass)
        if(verified === true) {
            console.log("logged in!")
            return jwt.sign({user: user}, "Mi*7N3D4k@&,4Dkl)98MdKj*7%nMQ3Tf");
        } else {
            console.log("here")
            throw ("invalid username or password");
        }
    };

    register_account = async function(user, pass) {
        let hash = await argon.hash(pass)
        try{
            await this.connection.promise().query('USE users;')
            await this.connection.promise().query('INSERT INTO userData(username, pass)\n' + '\tVALUES(?, ?);', [user, hash])
        } catch (error) {
            throw error;
        }

    }

    verify_account = function(token) {
        this.updateSongs();
        return jwt.verify(token, "Mi*7N3D4k@&,4Dkl)98MdKj*7%nMQ3Tf");
    }

    updateSongs = function() {
        let today = new Date();
        let dd = today.getDay();
        if(dd < 10) {dd = '0'+dd;}
        let mm = today.getMonth()+1;
        if(mm < 10) { mm = '0'+mm;}
        let yyyy = today.getFullYear();
        getChart('hot-100', yyyy+"-"+mm+"-"+dd, async (err, chart) => {
            if(err) console.log(err);
            let title = chart.songs[0].title;
            let artist = chart.songs[0].artist;
            console.log(title);
            chart.songs.forEach(e => {

                console.log(e);
                    // this.connection.promise().query('USE users;').then(() => {
                    //     getLyrics(e.title, e.artist).then(value => {
                    //         this.connection.promise().query('INSERT INTO songs(title, artist, lyrics)\n' + '\tVALUES(?, ?, ?);', [e.title, e.artist, value])
                    //     });
                    // });
            })
        })
    }
};

