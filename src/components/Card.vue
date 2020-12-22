<template>
    
    <div
        class="card"
        :class="[ selected ? 'card-selected' : '', altList ? 'card-alt' : '']"
        :style="backCard"
        @click="expandCard()"
        @keyup.enter="expandCard()"
        @mouseover="hover = true"
        @mouseleave="hover = false"
        tabindex="0"
    >

        <Loading
            v-if="!info || !loaded"
            :size="'40%'"
        ></Loading>

        <div
            v-if="basicLoaded"
            class="card-poster"
            :class="{ 'card-poster-alt': altList }"
            :style="backPoster"
        ></div>
        
            <div
                class="card-ep"
                :class="{ 'card-ep-alt': altList }"
            >
            <div v-if="basicLoaded" class="card-title-container">
                <p class="card-title" :style="titleStyle">{{title}}</p>
            </div>

            <EpisodeTitle
                v-if="!noRatings && loaded"
                class="card-ep-name"
                :lang="lang"
                :sXn="lowestEp.sXn"
                :title="lowestEp.title"
                :pilot="lowestEp.pilot"
                :seasonFinale="lowestEp.seasonFinale"
                :seriesFinale="lowestEp.seriesFinale"
            ></EpisodeTitle>
        </div>

        <div
            v-if="loaded"
            class="card-rating"
            :class="{ 'card-rating-alt': altList }"
        >
            <Rating
                :rating="(noRatings) ? 'N/A' : lowestEp.rating"
            ></Rating>
        </div>

        <CardDelete
            v-if="canDelete && loaded"
            :lang="lang"
            :hover="hover"
            :no-ratings="noRatings"
            :on-mobile="onMobile"
            @delete="$emit('delete', { listIndex: listIndex, cardID: cardID, selected: selected })"
        ></CardDelete>

    </div>

</template>

<script>

    import axios from 'axios'

    import {
        OMDB_KEY, TMDB_KEY, OMDB_URL, TMDB_URL, IMDB_URL,
        green, orange, red, ratingColor, fadeIn
    } from '@/variables.js'

    import Loading from '@/components/Loading.vue'
    import EpisodeTitle from '@/components/EpisodeTitle.vue'
    import Rating from '@/components/Rating.vue'
    import CardDelete from '@/components/CardDelete.vue'

    export default {
        name: 'Card',

        components: {
            Loading,
            EpisodeTitle,
            Rating,
            CardDelete
        },

        props: {
            lang: String,
            cardID: Number,
            search: String,
            index: Number,
            listIndex: Number,
            selected: Boolean,
            canDelete: Boolean,
            onMobile: Boolean,
            altList: Boolean
        },

        data: function() {
            return {
                isNull: false, //Could not find series
                info: null, //Will store series' info
                basicLoaded: false, //Ready to show basic data?
                loaded: false, //Ready to show all data?
                episodes: [], //Episodes array
                storedEps: [], //Episodes array (before adding the ones missing)
                storedSeasons: 0, //Number of stored seasons
                tmdbID: null, //TMDB ID of the series
                missingCount: 0, //How many episodes are missing from the OMDB API?
                mAdded_: 0, //How many missing episodes were added?
                hover: false //Is the mouse over the element?
            }
        },

        computed: {
            //Show the title of the series in bold if card is selected
            titleStyle: function() { return (this.selected) ? { fontWeight: 700 } : {} },
            //Set the color of the card's background and border (only if card has loaded)
            backCard: function() {
                if (this.loaded) {
                    let col = ratingColor(
                        (this.lowestEp) ? this.lowestEp.rating : 'N/A',
                        [
                            { background: 'rgb(0, 26, 6)', border: green },
                            { background: 'rgb(31, 28, 0)', border: orange },
                            { background: 'rgb(31, 7, 0)', border: red },
                            { background: 'grey', border: 'rgb(60, 60, 60)' }
                        ]
                    );

                    return  {
                        border: (this.selected) ? ('5px solid ' + col.border) : 'none',
                        backgroundColor: col.background
                    }
                } else return {};
            },
            //Set the poster's background image
            backPoster: function() { return { backgroundImage: 'url(' + this.poster + ')' }; },
            //Series info
            title: function() { return this.info.Title; },
            date: function() { return this.info.Year; },
            rating: function() { return this.info.imdbRating; },
            imdbID: function() { return this.info.imdbID; },
            poster: function() { return this.info.Poster; },
            finished: function() { return (!isNaN(this.date) || this.date.match(/\d+/g).length > 1); },
            totalSeasons: function() { return (this.info) ? parseInt(this.info.totalSeasons) : -1; },
            //In cases where the API could not find any episodes
            noRatings: function() { return !this.episodes.find(e => !isNaN(e.rating)); },
            //Episodes sorted from highest to lowest ratings
            sortedEps: function() {
                return this.episodes
                    .slice()
                    .sort((a, b) => a.rating - b.rating)
                    .filter(e => !isNaN(e.rating))
                    .reverse();
            },
            //Lowest-rated episode
            lowestEp: function() { return this.sortedEps[this.sortedEps.length - 1]; },
            //Series info that will be sent to parent app
            appInfo: function() {
                return (!this.isNull) ? {
                    cardInd: this.index,
                    listInd: this.listIndex,
                    selected: this.selected,
                    noRatings: this.noRatings,

                    title: this.title,
                    date: this.date,
                    rating: this.rating,
                    imdbID: this.imdbID,
                    imdbLink: IMDB_URL + this.imdbID,
                    poster: this.poster,
                    episodes: this.episodes,
                    sortedEps: this.sortedEps,
                    lowestEp: this.lowestEp,

                    aTitle: { en: 'Go to ' + this.title + ' on IMDB', es: 'Ir a ' + this.title + ' en IMDB' }
                } : { isNull: true };
            },
            //Find this series in the TMDB API
            tmdbFind: function() {
                return ''.concat(TMDB_URL, 'find/', this.imdbID, '?api_key=', TMDB_KEY, '&external_source=imdb_id');
            },
            //Missing episodes from the OMDB API that were added thanks to the TMDB API
            missingAdded: {
                get() { return this.mAdded_; },
                set(val) {
                    this.mAdded_ = val;
                    //If all missing episodes were added, map episodes
                    if (this.missingAdded === this.missingCount) this.mapEpisodes();
                }
            }
        },

        methods: {
            //Returns data of a season (OMDB API)
            getSeasonUrl: function(season) {
                return ''.concat(OMDB_URL, 'i=', this.imdbID, '&season=', season, '&type=series&apikey=', OMDB_KEY);
            },
            //Returns data of an episode (OMDB API)
            getEpisodeUrl: function(epID) {
                return ''.concat(OMDB_URL, 'i=', epID, '&apikey=', OMDB_KEY);
            },
            //Return the imdb ID of an episode (TMDB API)
            getEpisodeID: function(s, e) {
                return ''.concat(TMDB_URL, 'tv/', this.tmdbID, '/season/', s, '/episode/', e, '/external_ids?api_key=', TMDB_KEY);
            },

            //STEP 1. Store the TMDB id of the series, then procceed to add each season's episodes
            init() {
                axios
                .get(this.tmdbFind)
                .then(response => {
                    this.tmdbID = response.data.tv_results[0].id
                    this.addSeason(1);
                }).catch(error => {
                    console.log(error);
                    this.info = {
                        Title: 'N/A',
                        imdbID: 'N/A',
                    };
                    this.episodes = [{}];
                    this.isNull = this.basicLoaded = this.loaded = true;
                    this.$emit('store', this);
                });
            },
            //STEP 2. Find all episodes of each season, then procceed to find which episodes are missing
            addSeason: function(s) {
                axios
                    .get(this.getSeasonUrl(s))
                    .then(response => { this.findMissingEpisodes(response.data.Episodes, s) })
                    .catch(error => console.log(error));
            },
            //STEP 3. Find out if there are missing episodes from the OMDB API's data, and add a placeholders in its place.
            //This is a big problem with the API, and demands a series of functions that will try to find the missing info.
            findMissingEpisodes: function(eps, season) {
                let epCount = 0;
                let missingEps = eps;
                //Add missing episodes if the API couldn't find them
                for (let i = 0; i < eps.length; i++) {
                    let ep = eps[i];
                    let number = parseInt(ep.Episode);
                    missingEps[i].Season = season;
                    //Sometimes there's an episode listed as '0', 
                    //if that's the case, ignore it
                    if (number === 0) continue;
                    //Add to count
                    epCount++;
                    //If this is not the first episode...
                    if (i > 0) {
                        //If the numbers are right, no episode is missing
                        if (number === epCount) {
                            let next = eps[i + 1];
                            //Reset count if a new season starts with the next episode
                            if (next && parseInt(next.Episode) < epCount) epCount = 0;
                        //If an the episode's number is higher than it should be,
                        //there's an episode missing. Add it to the array
                        } else if (number > epCount) {
                            missingEps.splice(i, 0, { missing: true, ep: epCount, season: season });  
                            this.missingCount++;
                        //If that's not the case, an episode is stored twice in the array
                        //(happens very rarely). Remove one of the copies.
                        } else {
                            let prev = eps[i - 1];
                            if (prev && parseInt(prev.Episode) === number) {
                                missingEps.splice(i-1, 1);
                                epCount--;
                                i--;
                            }
                        }
                    //If this is the first episode and it's missing, add it
                    } else {
                        if (number === 1) continue;
                        else {
                            missingEps.unshift({ missing: true, ep: epCount, season: season });
                            this.missingCount++;
                        }
                    }
                }
                //Store episodes and mark season as ready
                this.storedEps.push(...missingEps);
                this.storedSeasons++;
                //If that was the last season, and there are no missing episodes, map the array. (Jump to last STEP)
                //If there are missing episodes, find and add them to the array. (Next STEP)
                //If this was not the last season, continue with the next one
                if (this.storedSeasons === this.totalSeasons) {
                    if (this.missingCount === 0) this.mapEpisodes();
                    else this.loopMissingEpisodes();
                } else this.addSeason(season + 1);
            },

            //STEP 4. Loop through all the stored episodes, find the ones missing (placeholders) and get their data
            loopMissingEpisodes: function() {
                for (let i = 0; i < this.storedEps.length; i++) {
                    let ep = this.storedEps[i];
                    if (!ep.missing) continue;
                    else this.getMissingEpisodes(i);
                }
            },

            //STEP 5. Replace a placeholder index with the actual episode info
            getMissingEpisodes: function(index) {
                let e = this.storedEps[index];
                //Find the imdb ID of the episode using TMDB API
                axios
                    .get(this.getEpisodeID(e.season, e.ep))
                    .then(response => {
                        let epID = response.data.imdb_id;
                        //Then use that imdb ID to find the info of the episode with OMDB API
                        this.replaceMissingEpisodes(e.ep, e.season, index, true, epID);
                    }).catch(error => {
                        console.log(error);
                        //If nothing was found, just add an episode with null properties
                        this.replaceMissingEpisodes(e.ep, e.season, index, false, '')
                    });
            },
            
            //STEP 6. After the data of a missing episode was found (or not), add the data to the episodes array
            replaceMissingEpisodes: function(number, season, index, findInfo, epID) {
                if (findInfo) {
                    axios
                    .get(this.getEpisodeUrl(epID))  //TODO: .catch en todos
                    .then(response2 => {
                        this.storedEps[index] = {
                            ...response2.data,
                            Episode: number,
                            Season: season
                        };
                        this.missingAdded++;
                    })
                //If no data was found, just add a 'null' episode
                } else {
                    this.storedEps[index] = {
                        Title: '?',
                        imdbRating: 'N/A',
                        imdbID: 'N/A',
                        Plot: 'N/A',
                        Released: 'N/A',
                        Episode: number,
                        Season: season
                    };
                    //One less missing episode to worry about. Once all episodes are done, procceed.
                    this.missingAdded++;
                }
            },
            //STEP 7, the final one. Add all episodes to the array an map the data
            mapEpisodes: function() {
                let eps = this.storedEps;
                let seriesLength = eps.length;
                let finished = this.finished;
                //Map and add each episode to the final array
                this.episodes = eps.map(function(ep, index) {
                    let number = parseInt(ep.Episode);
                    let season = parseInt(ep.Season);
                    let nextEp = eps[index + 1];
                    let lastIndex = (index === seriesLength - 1);
                    let seriesFinale = (finished && lastIndex);
                    //Final episode object
                    return {
                        index: index,
                        number: number,
                        season: season,
                        sXn: season + 'x' + ((number > 9) ? '' : '0') + number, //Example: 2x05 (Season 2, Ep. 5)
                        title: (ep.Title) ? ep.Title : '?',
                        date: ep.Released,
                        rating: parseFloat(ep.imdbRating),
                        imdbID: ep.imdbID,
                        //Is it a pilot episode, the series finale, the season finale, or the last episode of the array?
                        pilot: (number === 1 && season === 1),
                        seriesFinale: seriesFinale,
                        seasonFinale: (!seriesFinale && nextEp && parseInt(nextEp.Episode) < number),
                        lastIndex: lastIndex,
                    };
                });
                //Everything's ready.
                fadeIn(this.$el);
                this.loaded = true;
                this.$emit('store', this);
            },
            //Expand card if user clicks on it
            expandCard() {
                if (this.selected) return;
                this.$emit('expand-card', {
                    listIndex: this.listIndex,
                    cardIndex: this.index
                })
            }
        },
        
        mounted() {
            fadeIn(this.$el);
            //OMDB Url to get info about this series
            let url = ''.concat(OMDB_URL, this.search, '&type=series&apikey=', OMDB_KEY);
            //Get this series' info and trigger the first STEP to gather all the episodes' data
            axios
                .get(url)
                .then(response => {
                    this.info = response.data;
                    this.basicLoaded = true;
                    fadeIn(this.$el);
                    this.init(); //Starts STEP 1
                }).catch(error => console.log(error));
        }
    }

</script>