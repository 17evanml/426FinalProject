const axios = require('axios')

module.exports = {getSongs, getLyrics}

    async function getSongs() {
    try{
        const result = await axios({
            method: 'get',
            url: 'https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=100&country=us&f_has_lyrics=1&apikey=4aa392a349a05399572cd0d96c7b0cea',
        });
        return result.data;
    } catch(error) {
        console.log(error)
    }
}
    async function getLyrics(song) {
        try{
            const result = await axios({
                method: 'get',
                url: `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${song}&apikey=4aa392a349a05399572cd0d96c7b0cea`,
            });
            return result.data;
        } catch(error) {
            console.log(error)
        }
    }
