const axios = require('axios')

module.exports = async function getSongs() {
    try{
        const result = await axios({
            method: 'get',
            url: 'https://api.musixmatch.com/ws/1.1/chart.tracks.get?apikey=5f423b7772a80f77438407c8b78ff305&',
        });
        return result.data;
    } catch(error) {
        console.log(error)
    }
}