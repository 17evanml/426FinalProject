import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ClientAuth from "./clientAuth";
import GameInfo from "./GameInfo";
import {GamePage} from "./GamePage";

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: "",
            pass: "",
        }
    }

    handleUserTextChange(event) {
        this.setState(() => {
            return { user: event.target.value };
        });
    }
    handlePassTextChange(event) {
        this.setState(() => {
            return { pass: event.target.value };
        });
    }

    illegalCharacters(event) {
        if(event.keyCode === 13) {
            event.preventDefault();
            this.props.submitLogin(event, this.state.user, this.state.pass)
        }
    }

    render() {
        console.log(this.props.message);
        return(
            <form className = "login">
                <h1>Log in</h1>

                <input
                    placeholder = "Username"
                    onChange={this.handleUserTextChange.bind(this)}
                    maxLength = {40}
                    onKeyDown={this.illegalCharacters.bind(this)}
                />

                <br/>

                <input
                    placeholder = "Password"
                    onChange={this.handlePassTextChange.bind(this)}
                    maxLength = {40}
                    onKeyDown={this.illegalCharacters.bind(this)}
                    type={"password"}
                />
                <br/>
                <button
                    onClick={event => this.props.submitLogin(event, this.state.user, this.state.pass)}
                >Log in</button>
                <button
                    onClick={event => this.props.submitRegister(event, this.state.user, this.state.pass)}
                >Register</button>
                <span>{this.props.message}</span>
            </form>
        )
    }

}

function LoggingIn() {
   return(<form className = "login"><h2>Logging In..</h2></form>
    )
}

class EndScreen extends React.Component{
    constructor(props) {
        super(props)
        let win;
        if(this.props.won === 0) {
            win = "lost to "
        } else if (this.props.won === 1) {
            win = "beat "
        } else {
            win = "tied with "
        }
        this.state = {
            won: "You "+ win + this.props.opponent
        }
    }
    render() {
        return (<div className={"endScreen"}>
            <h1>{this.state.won}</h1>
            <br/>
            <button
            onClick={this.props.return}>Return to main screen</button>
        </div>)
    }
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.homePageView = {};
        this.homePageView.base = 0;
        this.homePageView.creatingRoom = 1;
        this.homePageView.joiningRoom = 2;
        this.homePageView.inLobby = 3;
        this.state = {
            viewMode: this.homePageView.base,
            roomCode: "",
            message: ""
        }
    }

    handleRoomCodeTextChange(event) {
        this.setState(() => {
            return { roomCode: event.target.value };
        });
    }

    createRoom() {
        this.props.createRoom().then(code => {
            console.log(code);
            this.props.joinGame(code).then(() => {
                this.setState({viewMode: this.homePageView.creatingRoom, roomCode: code})
            })
        }).catch(error => {
            throw error;
        })
    }

    joinRoom() {
        this.setState({viewMode: this.homePageView.joiningRoom});
    }

    illegalCharacters(event) {
        if(event.keyCode === 13) {
            event.preventDefault();
            this.joinGame(event);
        }
        if(!((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode === 8)) {
            event.preventDefault();
        }
    }
    joinGame(event) {
        event.preventDefault();
        this.props.joinGame(this.state.roomCode).then(() => {
                this.setState({viewMode: this.homePageView.inLobby})
        }).catch((error) => {
            if(error.response.status === 422) {
                console.log(error.response.message);
                if(error.response.data === "Does not exist") {
                    this.setState({message: "Room doesn't exist"})
                } else if (error.response.data === "Room full") {
                    this.setState({message: "Room full"});
                }
            }
        })
    }

    backToLobby() {
        this.setState({viewMode: this.homePageView.base})
    }

    render() {
        if(this.state.viewMode === this.homePageView.base) {
            return(
                <div className = "homepage">
                    <button onClick={this.createRoom.bind(this)}>Create Room</button>
                    <button onClick={this.joinRoom.bind(this)}>Join Game</button>
                </div>
            )
        } else if(this.state.viewMode === this.homePageView.creatingRoom) {
            return(
                <div className = "waitingroom">
                <h1>Room: {this.props.roomCode}</h1>
                <h2>Other player: {this.props.otherPlayer}</h2>
                <button onClick={this.props.startGame}>Start Game</button>
                <button
                    id={"backButton"}
                    onClick={this.backToLobby.bind(this)}>Back</button>
            </div>)
        } else if(this.state.viewMode === this.homePageView.joiningRoom) {
            return(
                <div className = "waitingroom">
                    <input
                        placeholder={"Room Code: "}
                        onChange={this.handleRoomCodeTextChange.bind(this)}
                        maxLength = {5}
                        onKeyDown={this.illegalCharacters.bind(this)}/>
                    <button
                        onClick={event => this.joinGame(event)}>Join Room</button>
                    <button
                        id = {"backButton"}
                        onClick={this.backToLobby.bind(this)}>Back</button>
                    <span>{this.state.message}</span>
                </div>)
        } else if(this.state.viewMode === this.homePageView.inLobby) {
            return(
                <div className = "waitingroom">
                    <h1>Room: {this.props.roomCode}</h1>
                    <h2>Other player: {this.props.otherPlayer}</h2>
                </div>
            )
        }
    }
}

class Site extends React.Component {
    constructor(props) {
        super(props);
        this.auth = new ClientAuth();
        this.gameInfo = new GameInfo();
        if(sessionStorage.getItem('Authorization') !== null) {
            this.auth.init(sessionStorage.getItem('Authorization')).then((value) => {
                this.setState(() => {return {loggedIn: this.auth.loginState}});
            })
        }
        this.state = {
            loggedIn: this.auth.loginStates.none,
            gameInfo: this.gameInfo,
            loginMessage: ""
        }
    }

    componentDidCatch(error, errorInfo) {
        console.log(error)
    }

    async login(event, user, pass) {
            event.preventDefault();
            if (user !== "" && pass !== "") {
                this.auth.login(user, pass).then(value => {
                    sessionStorage.setItem("Authorization", value.headers.authorization);
                    this.setState(() => {
                        return {loggedIn: this.auth.loginState}
                    })
                }, error => {
                    this.setState(() => {
                        return {loggedIn: this.auth.loginState, loginMessage: "Invalid Username or Password!"}
                    })
                })
                this.setState(() => {
                    return {loggedIn: this.auth.loginState}
                })
            } else {
                //Please write a username or password
            }
    }

    register(event, user, pass) {
        event.preventDefault();
        if(user !== undefined && pass !== undefined) {
            this.auth.register(user, pass).then((value) => {
                this.setState({loginMessage: "Thank you for registering! You may log in now."})
            }).catch(error => {
                if(error.response.status === 422) {
                    this.setState({loginMessage: "Username already exists. Try a different one."})
                }
            })
        }
    }

    roomCallback = function(message) {
        let messageObj = JSON.parse(message.data);

        if(messageObj.type === "playerName") {
                this.setState({gameInfo: this.state.gameInfo.setUser2(messageObj.name)});
            } else if (messageObj.type === "start") {
                this.setState({gameInfo: this.state.gameInfo.start()})
            } else if(messageObj.type === "song") {
                this.setState({gameInfo: this.state.gameInfo.setSong(messageObj)})
            } else if(messageObj.type === "correct" ) {
                this.setState({gameInfo: this.state.gameInfo.setAnswer(messageObj.correct)})
            } else if(messageObj.type === "strikes"){
                this.setState({gameInfo: this.state.gameInfo.setStrikes(messageObj.myStrikes, messageObj.opponentStrikes)})
            } else if(messageObj.type === "endGame") {
                this.setState({gameInfo: this.state.gameInfo.endGame(messageObj.myWin)})
            } else if (messageObj.type === "time") {
                this.setState({gameInfo: this.state.gameInfo.setTime(messageObj.time)})
            }else if (messageObj.type === "error") {
                this.roomErrorCallback(messageObj)
            }
    }

    roomErrorCallback = function(messageObj) {
        if(messageObj.code === "duplicatePlayer") {
            console.log("Can't join the same game twice");
        } else if (messageObj.code === "does not exist") {

        }
    }

    async createRoom() {
        return await this.auth.createRoom(sessionStorage.getItem('Authorization'));
    }

    async joinGame(code) {
        await this.auth.joinGame(code, sessionStorage.getItem('Authorization')).then(() => {
            console.log(code);
            this.auth.establishConnection(this.roomCallback.bind(this), code, sessionStorage.getItem('Authorization'))
            this.setState({gameInfo: this.state.gameInfo.setRoomCode(code)})
        }).catch(error => {
            throw(error);
        })
    }

    async roomError(callback) {
        callback();
    }

    async startGame() {
        await this.auth.startGame(this.state.gameInfo.roomCode, sessionStorage.getItem("Authorization"));
    }

    return() {
        this.setState({gameInfo: this.state.gameInfo.return()})
    }

    render() {
        if(this.state.gameInfo.gameState.state !== this.state.gameInfo.gameState.unfinished) {
          return(
              <EndScreen
                  won = {this.state.gameInfo.gameState.state}
                  opponent={this.state.gameInfo.user2}
                  return ={this.return.bind(this)}
              />
          )
        } else if(this.state.gameInfo.started === true) {
            return(
                <GamePage
                opponent={this.state.gameInfo.user2}
                myStrikes={this.state.gameInfo.myStrikes}
                opponentStrikes={this.state.gameInfo.opponentStrikes}
                lyricsLeft={this.state.gameInfo.lyricsLeft}
                lyricsRight={this.state.gameInfo.lyricsRight}
                code={this.state.gameInfo.roomCode}
                answerState = {this.state.gameInfo.answerState}
                submitAnswer = {this.auth.submit.bind(this.auth)}
                time = {this.state.gameInfo.time}
                artist = {this.state.gameInfo.artist}
                title = {this.state.gameInfo.title}
                />)
        } else {
            if(this.state.loggedIn === this.auth.loginStates.none) {
                return(
                    <div>
                        <LoginForm
                            submitLogin={this.login.bind(this)}
                            submitRegister={this.register.bind(this)}
                            message = {this.state.loginMessage}/>
                    </div>
                )
            }
            else if (this.state.loggedIn === this.auth.loginStates.loggingIn) {
                return(
                    <div>
                        <LoggingIn/>
                    </div>
                )
            }
            else if(this.state.loggedIn === this.auth.loginStates.loggedIn) {
                return(
                        <HomePage
                            createRoom = {this.createRoom.bind(this)}
                            joinGame = {this.joinGame.bind(this)}
                            startGame = {this.startGame.bind(this)}
                            roomCode = {this.state.gameInfo.roomCode}
                            otherPlayer = {this.state.gameInfo.user2}
                        />
                )
            }
        }

    }
}


// ========================================

ReactDOM.render(
    <Site/>,
    document.getElementById('root')
);

