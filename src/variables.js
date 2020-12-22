// let oKey, tKey;

// fetch(".netlify/functions/api")
// .then(response => response.json())
// .then(json => {
//     console.log('adsfsdf');
//     console.log(json);
    
// })

// oKey = process.env.VUE_APP_OMDB_KEY;
// tKey = process.env.VUE_APP_TMDB_KEY;

//Keys needed to use OMDB and TMDB API's
export const OMDB_KEY = process.env.VUE_APP_OMDB_KEY;
export const TMDB_KEY = process.env.VUE_APP_TMDB_KEY;
//OMDB and TMDB url
export const OMDB_URL = 'https://www.omdbapi.com/?';
export const TMDB_URL = 'https://api.themoviedb.org/3/';
//IMDB link
export const IMDB_URL = 'https://www.imdb.com/title/';

//Average and low rating marks (so the color changes)
export const ratingAv = 6.5;
export const ratingLow = 5;
//Colors
export const green = '#06d6a0';
export const orange = '#f99a63';
export const red = '#ef476f';


export const ratingColor = function(rating, options) {
    if (isNaN(rating)) return options[3];
    else return (rating > ratingAv) ? options[0] : ((rating > ratingLow) ? options[1] : options[2]);
}

//Reset the fade in animation of an element
export const fadeIn = function(el) {
    el.classList.remove('fade-in');
    void el.offsetWidth;
    el.classList.add('fade-in');
}