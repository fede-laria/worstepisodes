<template>
    
    <div id="search-bar">
        <input
            type="text"
            id="search-input"
            class="main-font"
            name="search"
            :placeholder="placeholderText[lang]"
            autocomplete="off"

            :style="borderRadius"
            v-model="input"
            @focus="focused = true"
            @keyup="inputChange()"
        />
        
        <button
            id="search-clear"
            :style="borderRadius"
            :disabled="input.length === 0"
            @click="input = ''"
        >X</button>

        <ul
            v-if="focused && showResults"
            id="search-results"
        >

            <template v-if="results.length === 0">
                <li v-if="searching" class="no-results" style="padding: 0">
                    <Loading
                        :size="'20px'"
                    ></Loading>
                </li>
                <li v-else-if="input.length > 0" class="no-results">
                    <p class="result-title">
                        {{noResultsText[lang]}} "{{input}}"
                        <br>
                        <span class="config-warning">{{originalLangText[lang]}}</span>
                    </p>
                </li>
            </template>

            <template
                v-else
            >
                <li
                    v-for="(result, index) in results"
                    :key="index"
                    class="result"
                    @click="addCard(result.imdbID)"
                    @keyup.enter="addCard(result.imdbID)"
                    tabindex="0"
                >
                    <img
                        v-if="result.poster"
                        class="result-poster"
                        :src="result.poster"
                    >
                    <div
                        v-else
                        class="result-poster result-poster-none"
                    >?</div>

                    <p class="result-title">
                        {{result.title}}
                    </p>
                </li>
            </template>
        </ul>
    </div>

</template>

<script>

    import axios from 'axios'
    
    import { OMDB_URL, OMDB_KEY } from '@/variables.js'

    import Loading from '@/components/Loading.vue'

    export default {
        name: 'SearchBar',

        components: {
            Loading
        },

        props: {
            lang: String,
            showResults: Boolean,
            onMobile: Boolean
        },

        data: function() {
            return {
                focused: false, //Is the search bar focused on?
                searching: false, //Is it searching anything?
                input_: '', //User input
                results: [], //Results array
                placeholderText: { en: 'Search series...', es: 'Busca una serie...' },
                noResultsText: { en: 'No results for ', es: 'No hay resultados para ' },
                originalLangText: { en: '', es: '(Busca el nombre en inglés)' }
            }
        },

        computed: {
            //If results are being shown, change the search bar's borders
            borderRadius: function() {
                let border = (!this.onMobile && this.focused && this.showResults && (this.input.length > 0)) ? '0px' : '';
                
                return {
                    borderBottomLeftRadius: border,
                    borderBottomRightRadius: border
                }
            },
            //User input. Remove results if there's no input
            input: {
                get() { return this.input_; },
                set(val) {
                    this.input_ = val;
                    if (val === '') this.results.length = 0;
                }
            }
        },

        methods: {
            searchUrl(inp) { return ''.concat(OMDB_URL, 's=', inp, '&type=series&apikey=', OMDB_KEY); },  
            //Make user input go from 'Game of Thrones' to 'game+of+thrones' and search for series
            inputChange() {
                let searchInput = this.input.toLowerCase().trim().split(' ').join('+');
                if (searchInput.length > 0) this.search(searchInput);
            },
            //Search for series
            search(inp) {
                this.searching = true;

                axios
                    .get(this.searchUrl(inp))
                    .then(response => {
                        this.searching = false;
                        let foundSeries = (response.data.Response === 'True');
                        //If series were found, add them to the array
                        if (foundSeries) {
                            let series = response.data.Search;
                            this.results = series.map(function(s) {
                                return {
                                    title: s.Title,
                                    imdbID: s.imdbID,
                                    poster: (s.Poster === 'N/A') ? undefined : s.Poster
                                };
                            });
                        }
                    }).catch(error => console.log(error))
            },
            //Add a card to the list if user clicks on a result
            addCard(imdbID) {
                this.input = '';
                this.$emit('add', 'i=' + imdbID);
            }
        }
    }

</script>