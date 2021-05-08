const jwt = require('jsonwebtoken')

const argon = require('argon2')

const mysql = require('mysql2')

const {getSongs, getLyrics} = require('./lyricsAndSongs')

require('dotenv').config();
const CodeGenerator = require('node-code-generator');
const generator = new CodeGenerator();
const pattern = '*****';
const howMany = 1;
const options = {};

module.exports = class AuthObj {
    constructor() {
        this.secretKey = process.env.SECRET_KEY;
        let dbCreds = {
            host: process.env.HOST,
            user: process.env.DBUSER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            waitForConnections: true
        }
        this.pool = mysql.createPool(dbCreds)

        this.checkDates();
    };


    check_password = async function(user, pass) {
        let results = await this.pool.promise().query('SELECT hash FROM userdata WHERE name = ?', [user])
        let salt = await this.pool.promise().query('SELECT salt FROM salts WHERE user = ?', [user])

        if(results[0][0] != undefined) {
            let verified = await argon.verify(results[0][0]['hash'], salt[0][0]['salt']+pass)
            if (verified === true) {
                return jwt.sign({user: user}, process.env.SECRET_KEY);
            } else {
                throw ("Unauthorized");
            }
        } else {
            throw ("Unauthorized");
        }

    };

    register_account = async function(user, pass) {
        console.log("register")
        try{
            let salt = generator.generateCodes(pattern);
            await this.pool.promise().query('INSERT INTO salts(user, salt)\n' + '\tVALUES(?, ?);', [user, salt])
            let hash = await argon.hash(salt+pass)
            await this.pool.promise().query('INSERT INTO userData(name, hash)\n' + '\tVALUES(?, ?);', [user, hash])
        } catch (error) {
            console.log(error);
            throw error;
        }

    }

    verify_account = function(token) {
        try {
            return jwt.verify(token, process.env.SECRET_KEY);
        } catch {
            return false;
        }
    }

    updateSongs = function() {
        let today = new Date();
        let dd = today.getDay();
        if(dd < 10) {dd = '0'+dd;}
        let mm = today.getMonth()+1;
        if(mm < 10) { mm = '0'+mm;}
        let yyyy = today.getFullYear();
    }

    getSong = async function() {
        try{
            let song = await this.pool.promise().query('SELECT * FROM songs ORDER BY RAND() LIMIT 1')
            return song[0][0];
        } catch (error) {
            console.log(error);
            // throw error;
        }
    }

    updateSongs = async function() {
        try{
            let songList = await getSongs()
            let songs = songList["message"]["body"]["track_list"]
            await this.pool.promise().query('TRUNCATE TABLE songs');
            for(let i = 0; i < songs.length; i++) {
                await this.pool.promise().query('INSERT INTO songs (title, artist) VALUES (?, ?)', [songs[i].track.track_name, songs[i].track.artist_name])
            }
            await this.pool.promise().query('SET SQL_SAFE_UPDATES = 0')
            for(let i = 0; i < songs.length; i++) {
                let lyrics = await getLyrics(songs[i].track.track_id)
                await this.pool.promise().query('UPDATE songs SET lyrics = ? WHERE title = ?', [lyrics["message"]["body"]["lyrics"]["lyrics_body"], songs[i].track.track_name])
            }
            await this.pool.promise().query('SET SQL_SAFE_UPDATES = 1')
        } catch (error) {
            console.log(error)
        }
    }

    checkDates = async function () {
        let oldDate = await this.pool.promise().query('SELECT * FROM querydates ORDER BY date DESC LIMIT 1')
        oldDate = oldDate[0][0].date
        let newDate = new Date();
        let deltaTime = newDate.getTime()-oldDate.getTime();
        let dayDiff = deltaTime / (1000 * 3600 * 24);
        console.log(`${dayDiff} days since last song update`);
        if(dayDiff > 7) {
            await this.pool.promise().query('INSERT INTO querydates (date) VALUES (?)', getToday())
            this.updateSongs().then(()=> {
                console.log("songs updated")
            })
        }
    }
};

//https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd
let getToday = function() {
    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}





