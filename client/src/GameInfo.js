 export default class GameInfo {
    constructor() {

        this.roomCode = "";
        this.user2 = "";

        this.myStrikes = 0;
        this.opponentStrikes = 0;

        this.started = false;

        this.answerState = {};
        this.answerState.state = -1;
        this.answerState.unanswered = -1;
        this.answerState.correct = 1;
        this.answerState.incorrect = 0;

        this.lyricsLeft = "";
        this.lyricsRight ="";
        this.word = "";

        this.gameState = {};
        this.gameState.won = 1;
        this.gameState.lost = 0;
        this.gameState.tied = 2;
        this.gameState.unfinished = -1;
        this.gameState.state = -1;

        this.time = 10;
    }

    setSong(song) {
        this.answerState.state = this.answerState.unanswered;
        this.title = song.title;
        this.artist = song.artist;
        this.lyricsLeft = song.lyricsLeft;
        this.lyricsRight = song.lyricsRight;
        this.word = song.word;
        return this;
    }

    setRoomCode = function(code) {
        this.roomCode = code.toUpperCase();
        return this;
    }

    setUser2 = function(user2) {
        console.log(user2);
        this.user2 = user2;
        return this;
    }

    start = function() {
        this.started = true;
        return this;
    }

    setStrikes = function(myStrikes, opponentStrikes) {
        this.myStrikes = myStrikes;
        this.opponentStrikes = opponentStrikes;
        return this;
    }

    setAnswer(correct) {
        if(correct) {
            this.answerState.state = this.answerState.correct;
        } else {
            this.answerState.state = this.answerState.incorrect;
        }
        return this;
    }

    setTime(time) {
        this.time = time;
        return this;
    }

    endGame(state) {
        this.gameState.state = state;

        this.started = false;
        this.answerState.state = -1;

        this.roomCode = "";

        this.myStrikes = 0;
        this.opponentStrikes = 0;

        this.title = "";
        this.artist = "";
        this.lyricsLeft = "";
        this.lyricsRight = "";

        return this;
    }

    return() {
        this.user2 = "";
        this.gameState.state = this.gameState.unfinished;
        return this;
    }

}
