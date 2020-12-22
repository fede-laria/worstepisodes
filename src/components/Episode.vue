<template>
    
    <div id="ep-info" class="black-color">
        <div style="position: relative" ref="topInfo">

            <p
                v-if="rankingHover"
                class="ep-ranking-hover"
                v-html="navigateRatingsText[lang]"
            ></p>

            <button
                class="ep-ranking"
                :class="{ 'ep-ranking-selected': rankingSelected }"
                :style="rankingBack"
                :disabled="ratingNull"
                @click="rankingSelected = !rankingSelected"
                @mouseover="rankingHover = true"
                @mouseleave="rankingHover = false"
            >

                <div>
                    <p v-if="!ratingNull" class="ep-ranking-p">
                        #<b>{{showRanking}}</b>
                    </p>
                    <p v-else class="ep-ranking-p">
                        ?
                    </p>

                    / {{sortedEps.length}}
                </div>

            </button>

            <Rating :rating="info.rating" class="ep-rating"></Rating>
        
            <EpisodeTitle
                id="ep-title"
                :lang="lang"
                :sXn="info.sXn"
                :title="info.title"
                :pilot="info.pilot"
                :seasonFinale="info.seasonFinale"
                :seriesFinale="info.seriesFinale"
            ></EpisodeTitle>
        </div>

        <div
            id="ep-info-bottom"
        >
            <div
                id="ep-info-container"
                class="copy-font"
                ref="plotContainer"
            >
                <template v-if="plotLoaded">
                    
                    <div id="plot-container">
                        <p
                            id="ep-plot"
                            :class="{ 'plot-blurred': plotBlurred }"
                        >
                            <span v-if="!plotNull">{{plot}}</span>
                            <span v-else style="color: grey">{{noPlotFoundText[lang]}}</span>
                        </p>

                        <div class="plot-show">
                            <button
                                class="gradient"
                                :class="gradientMove"
                                v-if="plotBlurred"
                                @click="plotBlurred = false"
                            >{{showPlotText[lang]}}</button>
                        </div>
                    </div>

                    <a 
                        v-if="!imdbNull"
                        id="ep-imdb"
                        :href="imdbUrl"
                        target="_blank"
                        :title="moreInfoTitleText[lang]"
                    >&gt; {{moreInfoText[lang]}} &lt;</a>
                
                </template>

                <Loading
                    v-else
                    :size=" '25%' "
                ></Loading>
            </div>

            <div id="ep-button-container">
                <button
                    id="ep-lowest-button"
                    class="gradient ep-button"
                    :class="gradientMove"
                    :disabled="info.index === lowestIndex"
                    @click="$emit('change-ep', lowestIndex)"
                >
                    {{lowestRatedText[lang]}} (<b>{{lowestX}}</b>)
                </button>

                <button
                    class="gradient ep-button"
                    :class="gradientMove"
                    :disabled="prevDisabled"
                    @click="$emit('change-ep', prevIndex)"
                >
                    &#60;
                </button>
                <button
                    class="gradient ep-button"
                    :class="gradientMove"
                    :disabled="nextDisabled"
                    @click="$emit('change-ep', nextIndex)"
                >
                    &#62;
                </button>
            </div>
        </div>
    </div>

</template>

<script>

    import axios from 'axios'

    import {
        IMDB_URL, OMDB_URL, OMDB_KEY,
        fadeIn, ratingColor, green, orange, red
    } from '@/variables.js'

    import Loading from '@/components/Loading.vue'
    import EpisodeTitle from '@/components/EpisodeTitle.vue'
    import Rating from '@/components/Rating.vue'

    export default {
        name: 'Episode',

        components: {
            Loading,
            EpisodeTitle,
            Rating
        },

        props: {
            lang: String,
            info: Object,
            seriesTitle: String,
            gradientMove: String,
            lowestIndex: Number,
            sortedEps: Array,
            spoilers: Boolean
        },

        data: function() {
            return {
                plot_: '', //Episode's plot
                plotBlurred_: this.spoilers, //Will blur the episode to avoid spoilers
                storedPlots: {}, //Store gathered plots in case they need to be shown again
                plotLoaded: false, //Has the plot loaded?
                rankingHover: false, //Is the mouse over the ranking (episode's rating position) container?
                rSelected_: false, //Navigate episodes by ranking or not
                noPlotFoundText: { en: 'No plot found.', es: 'No se encontró la trama.' },
                showPlotText: { en: 'Show Plot', es: 'Mostrar Trama' },
                moreInfoText: { en: 'More info on IMDB', es: 'Más info en IMDB' },
                lowestRatedText: { en: 'Lowest-rated episode', es: 'Episodio más bajo' }
            }
        },

        computed: {
            imdbUrl: function() { return IMDB_URL + this.info.imdbID; },
            //Episode's rating position (#1 = highest-rated / #Last = lowest-rated)
            ranking: function() { return this.sortedEps.findIndex(e => e.index === this.info.index); },
            showRanking: function() { return this.ranking + 1; },
            //In case there are null values
            plotNull: function() { return (!this.plot || this.plot === 'N/A'); },
            ratingNull: function() { return isNaN(this.info.rating); },
            imdbNull: function() { return (!this.info.imdbID || this.info.imdbID === 'N/A') },
            //If rankingSelected = true, when the user clicks on the 'previous' or 'next episode' arrows,
            //it will move to the next episode in the ranking instead of following chronological order
            rankingSelected: {
                get() { return (this.ratingNull) ? false : this.rSelected_; },
                set(val) { this.rSelected_ = val; }
            },
            
            navigateRatingsText: function() {
                return {
                    en: 'Navigate Ratings: ' + ((this.rankingSelected) ? '<b>On</b>' : 'Off'),
                    es: 'Navegar por Ratings: ' + ((this.rankingSelected) ? '<b>Activado</b>' : 'Desactivado')
                }
            },
            //sXn of lowest-rated episode (Example: 2x05)
            lowestX: function() { return this.sortedEps[this.sortedEps.length - 1].sXn; },
            //When plot changes, apply a blur to avoid spoilers (unless user specified not to)
            plot: {
                get() { return this.plot_; },
                set(val) {
                    this.plot_ = val;
                    this.plotLoaded = true;
                    if (this.plotNull) this.plotBlurred = false;

                    let el = this.$refs.plotContainer;
                    if (el) fadeIn(el);
                }
            },
            //If the plot blurred? (If it is, it will display a 'Show Plot' button over it)
            plotBlurred: {
                get() { return (this.spoilers) ? this.plotBlurred_ : false; },
                set(val) { this.plotBlurred_ = val; }
            },
            //Episode to move onto when user clicks on 'Previous Episode'/'Next Episodes' arrows
            prevIndex: function() {
                return (this.rankingSelected) ? this.sortedEps[this.ranking + 1].index : (this.info.index - 1);
            },
            nextIndex: function() {
                return (this.rankingSelected) ? this.sortedEps[this.ranking - 1].index : (this.info.index + 1);
            },
            //Disable or enable arrows (if there is previous/next episode)
            prevDisabled: function() {
                return (this.rankingSelected) ? (this.showRanking === this.sortedEps.length) : (this.info.index === 0);
            },
            nextDisabled: function() {
                return (this.rankingSelected) ? (this.ranking === 0) : (this.info.lastIndex);
            },
            //Change ranking container background color if it's selected
            rankingBack: function() {
                return {
                    backgroundColor: (this.rankingSelected) ?
                        ratingColor(this.info.rating, [green, orange, red, 'lightgrey']) : 'transparent'
                }
            },
            moreInfoTitleText: function() {
                return {
                    en: 'More info about Season ' + this.info.season + ' Episode '
                        + this.info.number + ' of ' + this.seriesTitle + ' on IMDB',
                    es: 'Más información sobre Temporada ' + this.info.season + ' Episodio '
                        + this.info.number + ' de ' + this.seriesTitle + ' en IMDB'
                }
            }
        },

        watch: {
            //When user selects a different episode or series, update component
            info: {
                immediate: true,
                handler(val, oldVal) {
                    if (oldVal && val.imdbID === oldVal.imdbID) return;
                    let id = val.imdbID;
                    this.plotBlurred = true;
                    this.plotLoaded = false;

                    let el = this.$refs.topInfo;
                    if (el) fadeIn(el);
                    //Find plot and store if it hasn't been stored already
                    if (!this.storedPlots[id]) {
                        let url = ''.concat(OMDB_URL, 'i=', id, '&apikey=', OMDB_KEY);

                        axios
                            .get(url)
                            .then(response => {
                                this.storedPlots[id] = response.data.Plot
                                this.plot = response.data.Plot;
                            });

                    } else this.plot = this.storedPlots[id];
                }
            }
        }
    }

</script>