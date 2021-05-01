const axios = require('axios');
const getSongs = require('./lyricsAndSongs.js')
async function TestDB()
{
    try{
        const result = await axios({
            method: 'post',
            url: 'http://localhost/login',
            data: {
                user: 'evan',
                pass: 'pass'
            },
        });
        console.log(result)
        return result;
    } catch(error) {
        console.log(error)
    }

}

// TestDB();
getSongs().then(value => {
    console.log(value)
})