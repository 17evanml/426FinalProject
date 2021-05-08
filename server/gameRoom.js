const CodeGenerator = require('node-code-generator');
const generator = new CodeGenerator();
const pattern = '*****';
const howMany = 100;
const options = {};
const StopwordsFilter = require('node-stopwords-filter');

const f = new StopwordsFilter();

module.exports = class GameRooms {
    constructor() {
        this.rooms = {};
        this.codes = generator.generateCodes(pattern, howMany, options);
    }

    newRoom = function(getSong) {
        let code = this.codes.pop();
        this.rooms[code] = new GameRoom(code, getSong, this.destroyRoom.bind(this));
        console.log(this.rooms[code]);
        return code;
    }

    destroyRoom = function(code) {
        this.codes.unshift(code);
        this.rooms[code] = null;
    }
    
    join = function(code, user, callback) {
        if(this.rooms[code] !== undefined) {
            this.rooms[code].registerUser(user, callback);
            return true;
        } else {
            return false;
        }
    }

    isOpen = function(code) {
        if(this.rooms[code] !== undefined && (this.rooms[code].user1 === undefined || this.rooms[code].user2 === undefined)) {
            return true;
        } else if(this.rooms[code] === undefined) {
            throw new Error("Does not exist");
        } else if(!(this.rooms.code.user1 === undefined || this.rooms.code.user2 === undefined)) {
            throw new Error("Room full");
        }
    }
}

class GameRoom {
    constructor(code, getSong, destroyRoom) {
        this.getSong = getSong;
        this.roomCode = code;

        this.destroyRoom = destroyRoom;

        this.user1 = undefined;
        this.user2 = undefined;
        this.user1Send = undefined;
        this.user2Send = undefined;

        this.started = false;
        this.round = 0;

        this.user1Strikes = 0;
        this.user2Strikes = 0;

        this.song = {};
        this.lyrics = {};

        this.user1Submitted = false;
        this.user2Submitted = false;

        //Destroy room if it idles for 5 minutes.
        setTimeout(() => {
            if(this.started === false) {
                this.destroyRoom(this.roomCode);
            }
        }, 300000)
    }

    async start() {
        if(this.user1 !== undefined && this.user2 !== undefined) {
            this.sendMessage(2, this.startMessage())
            await this.startRound()
            this.started = true;
        }
    }

    registerUser = function(user, callback) {
        if(this.user1 === undefined) {
            this.user1 = user;
            this.user1Send = callback;
        } else if (this.user2 === undefined ) {
            this.user2 = user;
            this.user2Send = callback;
            this.sendMessage(0, this.playerNameMessage(this.user2));
            this.sendMessage(1, this.playerNameMessage(this.user1));
        } else if (user === this.user1) {
            this.user1Send = callback;
        } else if (user === this.user2) {
            this.user2Send = callback;
        } else {
            console.log("Room Full");
        }
        console.log(this);
    }

    advanceRound() {
        this.round++;
        if(this.user1Submitted === false) {
            this.user1Strikes++;
        }
        if(this.user2Submitted === false) {
            this.user2Strikes++;
        }
        this.user1Submitted = false;
        this.user2Submitted = false;
        this.sendStrikes();
        if(!this.checkWinner()) {
            this.startRound();
        }
    }

    async startRound() {
        this.song = await this.getSong();
        this.lyrics = this.splitLyrics(this.song.lyrics);
        this.sendMessage(2, this.songMessage(this.song, this.lyrics))
        this.roundTimer(10, this.round, this.timeMessage.bind(this));
    }


    checkWinner() {
        if (this.user1Strikes === 3 && this.user2Strikes === 3) {
            console.log("tie")
            this.sendMessage(2, this.endGameMessage(2))
            this.destroyRoom(this.roomCode);
            return true;
        } else if (this.user1Strikes === 3) {
            console.log("1 wins")
            this.sendMessage(0, this.endGameMessage(0))
            this.sendMessage(1, this.endGameMessage(1))
            this.destroyRoom(this.roomCode);
            return true;
        } else if (this.user2Strikes === 3) {
            console.log("2 wins")
            this.sendMessage(0, this.endGameMessage(1))
            this.sendMessage(1, this.endGameMessage(0))
            this.destroyRoom(this.roomCode);
            return true;
        } else {
            return false;
        }
    }

    roundTimer(timeLeft, round, timeMessage) {
        this.sendMessage(2, this.timeMessage(timeLeft))
        if(this.round != round) {
            return;
        } else if(timeLeft <= 0) {
            this.advanceRound()
        } else {
            setTimeout(() => this.roundTimer(timeLeft-1, round, timeMessage), 1000)
        }
    }


    sendStrikes() {
        this.sendMessage(0, this.strikeMessage(this.user1Strikes, this.user2Strikes))
        this.sendMessage(1, this.strikeMessage(this.user2Strikes, this.user1Strikes))
    }
    splitLyrics(lyrics) {
        //Remove special characters from the lines.
        let lines = lyrics.replace(/\(|\)/g, "").replace(/\(|\)/g,"").replace(/'/g, "").replace("******* This Lyrics is NOT for Commercial use *******", "").split("\n");
        //Filter out all stopwords
        let sWords = [];
        for(let i = 0; i < lines.length; i++) {
            sWords.push(f.filter(lines[i]));
        }
        //Pick a line which has non-stopwords
        let lineStopWords = [];
        let randomLine = 0;
        while(lineStopWords.length <= 0) {
            randomLine = Math.floor(Math.random()*sWords.length);
            lineStopWords = sWords[randomLine];
        }
        //Pick a random word in the line
        let randomWord = Math.floor(Math.random()*lineStopWords.length);
        let line = lines[randomLine];
        let word = sWords[randomLine][randomWord];
        let wordIndex = line.toLowerCase().indexOf(word.toLowerCase());

        //Split the line up into the component parts.
        return {left: line.substr(0, wordIndex), right: line.substr(wordIndex+word.length, line.length), word: word}
    }
    submit(user, answer) {
        let resp = false;
        let respUser = -1;
        if(this.lyrics.word.toLowerCase() === answer.toLowerCase()) {
            resp = true;
        }
        if(user === this.user1 && this.user1Submitted === false) {
            this.user1Submitted = true;

            respUser = 0;
            if(!resp) {
                this.user1Strikes++;
                this.sendStrikes();
            }
            if(this.user2Submitted === true) {
                this.advanceRound()
            }
        } else if (user === this.user2 && this.user2Submitted === false) {
            this.user2Submitted = true;
            respUser = 1
            if(!resp) {
                this.user2Strikes++;
                this.sendStrikes();
            }
            if(this.user1Submitted === true) {
                this.advanceRound()
            }
        } else {
            console.log("Unauthorized: User not in lobby")
        }
        this.sendMessage(respUser, this.correctMessage(resp));
    }
    
    playerNameMessage(user) {
        return `data: {\n`+
            `data: "type": "playerName",\n` +
            `data: "name": "${user}"\n`+
            `data: }\n\n`
    }
    songMessage(song, lyrics) {
        return `data: {\n`+
            `data: "type": "song",\n` +
            `data: "title": "${song.title}",\n`+
            `data: "artist": "${song.artist}",\n`+
            `data: "lyricsLeft": "${lyrics.left}",\n`+
            `data: "lyricsRight": "${lyrics.right}"\n`+
            `data: }\n\n`
    }
    startMessage() {
        return `data: {\n`+
            `data: "type": "start"\n` +
            `data: }\n\n`
    }
    correctMessage(correct) {
        return `data: {\n`+
            `data: "type": "correct",\n` +
            `data: "correct": ${correct}\n` +
            `data: }\n\n`
    }
    strikeMessage(myStrikes, opponentStrikes) {
        return `data: {\n`+
            `data: "type": "strikes",\n` +
            `data: "myStrikes": "${myStrikes}",\n` +
            `data: "opponentStrikes": "${opponentStrikes}"\n` +
            `data: }\n\n`
    }
    endGameMessage(myWin) {
        return `data: {\n`+
            `data: "type": "endGame",\n` +
            `data: "myWin": ${myWin}\n` +
            `data: }\n\n`
    }
    timeMessage(time) {
        return `data: {\n`+
            `data: "type": "time",\n` +
            `data: "time": "${time}"\n` +
            `data: }\n\n`
    }

    sendMessage(user, message) {
        if(user === 0) {
            this.user1Send(message);
        } else if (user === 1) {
            this.user2Send(message);
        } else if (user === 2) {
            this.user1Send(message);
            this.user2Send(message);
        }

    }
}