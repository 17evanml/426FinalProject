import React from 'react';

export {GamePage};

function StrikeMarker(props) {
    return(<span
        className = "strikeMarker"
        style={props.style}
        />)
}

class StrikeMarkerList extends React.Component {
    constructor(props) {
        super(props);
    }

    renderMarker(num, strikes) {
        if(strikes >= num) {
            return <StrikeMarker style={{backgroundColor: "red"}}/>
        } else {
            return <StrikeMarker/>
        }

    }
    render() {
        return(<div className={"strikeMarkerList"}>
                {this.renderMarker(3, this.props.strikes)}
                {this.renderMarker(2, this.props.strikes)}
                {this.renderMarker(1, this.props.strikes)}
            </div>

        )
    }
}


class GamePage extends React.Component {
    constructor(props){
        super(props);
        window.addEventListener("keydown", event => this.handleKeyPress(event))
        this.state = {
            lyricsLeft: "The duck walked up to the \n",
            lyrics: "________",
            lyricsRight: "\n stand",
            edited: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.lyricsLeft != this.props.lyricsLeft) {
            this.setState({lyrics: "________", edited: false});
        }
    }

    handleKeyPress(event) {
        if(event.keyCode === 13) {
            this.props.submitAnswer(sessionStorage.getItem("Authorization"), this.props.code, this.state.lyrics)
        } else if(event.keyCode === 8) {
                this.setState({lyrics: this.state.lyrics.substr(0, this.state.lyrics.length-1)})
        } else if((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode === 189) {
            if(!this.state.edited) {
                this.setState({edited: true, lyrics: event.key})
            } else {
                this.setState({lyrics: this.state.lyrics+event.key})
            }
        }
    }

    renderAnswerState() {
        if(this.props.answerState.state === this.props.answerState.correct) {
            return (<span
                id={"answer"}
                style={{color: 'Green'}}
            >Correct!</span>);
        } else if (this.props.answerState.state === this.props.answerState.incorrect) {
            return (<span
                    id={"answer"}
                    style={{color: 'Red'}}
                    >Incorrect!</span>);
        } else {
            return (null);
        }
    }

    render() {
        return(<div className={"container"}>
            <div>
                <StrikeMarkerList
                strikes = {this.props.myStrikes}/>
            </div>
            <div
                className={"middleColumn"}>
                <div id = "timer">
                    <span>{this.props.time}</span>
                </div>
                <div id = "info">
                    <span className={"songInfo"}>{this.props.title}</span>
                    <br/>
                    <span className={"songInfo"}> {this.props.artist}</span>
                </div>
                <span id = "lyrics">{this.props.lyricsLeft+this.state.lyrics+this.props.lyricsRight}</span>
                {this.renderAnswerState()}
            </div>
            <div>
                <StrikeMarkerList
                strikes = {this.props.opponentStrikes}/>
            </div>
        </div>)
    }
}