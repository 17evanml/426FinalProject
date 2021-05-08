import axios from 'axios';

 export default class ClientAuth {
     constructor() {
        this.loggedIn = false;
        this.authorization = undefined;
        this.loginStates = {};
        this.loginStates.none = 0;
        this.loginStates.loggingIn = 1;
        this.loginStates.loggedIn = 2;
        this.loginState = this.loginStates.none;
        this.eventSource = undefined;
    }


    async init(jwt) {
        if(jwt !== undefined ) {
            let verified = await this.verify(jwt);
            return verified;
        }
    }
    async login(user, pass) {
        this.loginState=this.loginStates.loggingIn;
        try{
            const result = await axios({
                method: 'post',
                url: 'https://lyric-guessr.herokuapp.com/login',
                // url: 'http://localhost/login',
                data: {
                    user: user,
                    pass: pass
                },
            });
            this.authorization = result.headers.authorization;
            this.loginState = this.loginStates.loggedIn;
            return result;
        }
        catch(error) {
            this.loginState = this.loginStates.none;
            throw(error)
        }
    }
    async verify(jwt) {
        try{
            const result = await axios({
                method: 'post',
                url: 'https://lyric-guessr.herokuapp.com/verify',
                // url: 'http://localhost/verify',
                headers: {
                    authorization: jwt
                },
                data: {
                },
            });
            this.loginState = this.loginStates.loggedIn;
            return result;
        } catch(error) {
            throw (error);
        }

    }
    async register(user, pass) {
        try{
            const result = await axios({
                method: 'post',
                url: 'https://lyric-guessr.herokuapp.com/register',
                // url: 'http://localhost/register',
                data: {
                    user: user,
                    pass: pass
                },
            });
            return result;
        } catch(error) {
            console.log(error);
            throw error;
        }

    }
    async createRoom(jwt) {
        try{
            const result = await axios({
                method: 'get',
                url: 'https://lyric-guessr.herokuapp.com/createRoom',
                // url: 'http://localhost/createRoom',
                headers: {
                    authorization: jwt
                },
            });
            console.log(result.data.code);
            return result.data.code;
        } catch(error) {
            console.log(error)
        }
    }
    async startGame(code, jwt) {
         console.log("startGame")
        try{
            const result = await axios({
                method: 'post',
                url: 'https://lyric-guessr.herokuapp.com/startGame',
                // url: 'http://localhost/startGame',
                data: {
                    code: code.toUpperCase(),
                },
                headers: {
                    authorization: jwt
                },
            });
            return result;
        } catch(error) {
            console.log(error)
        }
    }

     async joinGame(code, jwt) {
         try{
             const result = await axios({
                 method: 'post',
                 url: 'https://lyric-guessr.herokuapp.com/joinGame',
                 // url: 'http://localhost/joinGame',
                 data: {
                     code: code.toUpperCase(),
                 },
                 headers: {
                     authorization: jwt
                 },
             });
             return result;
         } catch(error) {
             throw error;
         }
     }
    async establishConnection(callback, code, jwt) {
         const source = new EventSource(`https://lyric-guessr.herokuapp.com/establishConnection/${code.toUpperCase()}/${jwt}`);
         // const source = new EventSource(`http://localhost/establishConnection/${code.toUpperCase()}/${jwt}`);
         source.addEventListener('message', message => callback(message));
     }

     async submit(jwt, code, answer) {
         console.log(answer);
         try{
             const result = await axios({
                 method: 'post',
                 url: 'https://lyric-guessr.herokuapp.com/submit',
                 // url: 'http://localhost/submit',
                 data: {
                     code: code.toUpperCase(),
                     answer: answer
                 },
                 headers: {
                     authorization: jwt
                 },
             });
             return result;
         } catch(error) {
             console.log(error)
         }
     }
}