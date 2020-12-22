exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            omdb: process.env.OMDB_KEY,
            tmdb: process.env.TMDB_KEY
        })
    }
}