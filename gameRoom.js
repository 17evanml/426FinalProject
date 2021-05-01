class GameRoom {
    constructor(user) {
        this.user1 = user;
        this.user2 = undefined;
        this.started = false;
        this.round = 0;
    }

    start() {
        if(user1 !== undefined && user2 !== undefined) {
            this.started = true;
        }
    }

    join(user2) {
        this.user2 = user2;
    }

    advanceRound() {

    }

}