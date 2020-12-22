exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            omdb: process.env.VUE_APP_OMDB_KEY,
            tmdb: process.env.VUE_APP_TMDB_KEY
        }),
    }
}