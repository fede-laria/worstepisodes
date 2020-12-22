<template>

    <div
        id="app"
        class="main-font"
        :class="{ 'container-height': expanded }"
        @click="lostFocus($event)" 
    >

        <header id="header">
            <!-- Gradient background for header -->
            <div 
                id="header-gradient"
                class="gradient gradient-contain"
                :class="gradientMove"
            ></div>

            <!-- Logo -->
            <div id="header-logo-container" class="header-item">
                <img
                    id="logo-pc"
                    class="header-logo"
                    src="@/assets/svg/brand.svg"
                    @click="clickOnLogo()"
                    alt="WorstEpisodes"
                />
                <img
                    id="logo-phone"
                    class="header-logo"
                    src="@/assets/svg/logo.svg"
                    @click="clickOnLogo()"
                    alt="WorstEpisodes"
                />
            </div>

            <!-- Search bar -->
            <div id="search-bar-container" class="header-item" ref="searchBar">
                <SearchBar
                    @add="addCard($event, 0, true)"
                    :lang="lang"
                    :show-results="showSearchResults"
                    :on-mobile="onMobile"
                ></SearchBar>
            </div>

            <!-- Options and About -->
            <div class="header-item" v-cloak>
                <ul id="header-nav">
                    <li
                        v-for="(button, index) in navButtons"
                        :key="index"
                    >
                        <button
                            class="main-font"
                            :class="[ (activeOption === index) ? 'nav-button-active' : 'nav-button' ]"
                            @click="openNavButton(index)"
                            ref="navButtons"
                        >
                            <!-- {{button.text[lang]}} -->
                            <img
                                :src="button.svg" 
                                :alt="button.alt"
                                width="20px"
                                style="pointer-events: none"
                            >
                        </button>
                    </li>
                </ul>

                <div ref="config">
                    <HeaderConfig
                        v-if="activeOption >= 0"
                        @config-change="configChange($event)"
                        @about="activeOption = 1"
                        @why="whyInfoEnglish()"
                        :lang="lang"
                        :active-option="activeOption"
                        :config="config"
                        :highlight-why="highlightWhy"
                    ></HeaderConfig>

                    <WarningLang
                        v-if="showWarningLang"
                        :red-box="true"
                        :delete-self="10000"
                        @why="whyInfoEnglish()"
                        ref="warningBox"
                        id="warning-pop-up"
                    ></WarningLang>
                </div>
            </div>
        </header>

        
        <main
            id="series"
            :class="{ 'series-overflow': expanded }"
            :style="seriesContainerStyle"
            v-cloak
        >
            <!-- <div
                id="series-background"
                class="gradient"
                :class="gradientMove"
            ></div> -->
            <button
                id="series-lists-black-box"
                v-if="!listsHidden"
                @click="listsHidden = true"
            ></button>

            <button
                id="series-lists-selected"
                v-if="listsHidden && expandedCard"
                @click="listsHidden = false"
            >
                <p id="series-lists-selected-p">
                    <b>{{expandedCard.title}}</b>
                    <br>
                </p>
                <div id="series-lists-selected-burger">
                    <p id="series-lists-selected-burger-p">III</p>
                </div>
            </button>

            <!-- Series lists -->
            <div
                id="series-lists-container"
                v-show="!listsHidden"
            >

                <ul
                    id="series-lists"
                    :class="[expanded ? 'series-lists-small' : 'series-lists-full']"
                    ref="seriesLists"
                >
                    <li
                        v-for="(list, listIndex) in lists"
                        :key="listIndex"
                        v-show="list.cards.length > 0"
                        :class="{ 'series-li-width': !expanded }"
                    >
                        <!-- List header -->
                        <div
                            class="list-header black-color"
                            @click="list.showCards = !list.showCards"
                            @keyup.enter="list.showCards = !list.showCards"
                            tabindex="0"
                        >
                            <div
                                class="list-toggler"
                                :class="{ 'list-toggler-right': !list.showCards }"
                            >&#x25BC;</div>

                            <div>
                                <p class="list-name">
                                    {{list.name[lang]}}
                                </p>

                                <p class="list-description" :class="{ 'list-description-margin': expanded }">
                                    {{list.description[lang]}}
                                </p>
                            </div>

                            <div class="list-line black-back" v-if="!expanded"></div>
                        </div> <!-- List header -->

                        <!-- Cards -->
                        <ul 
                            v-show="list.showCards"
                            class="series-ul"
                            :class="[ list.reverse ? 'series-ul-reverse' : '', config.altList ? 'series-ul-alt' : '']"
                        >
                            <li
                                v-for="(card, index) in list.cards"
                                :key="card.cardID"
                                :class="{ 'line-break': ((list.reverse) ? lineBreak(listIndex, index) : false) }"
                            >
                                <Card
                                    @expand-card="expandCard($event)"
                                    @delete="deleteCard($event)"
                                    @store="storeCard($event)"
                                    :lang="lang"
                                    :index="index"
                                    :card-i-d="card.cardID"
                                    :search="card.search"
                                    :list-index="listIndex"
                                    :selected="expanded && card.selected"
                                    :can-delete="list.canDelete"
                                    :on-mobile="onMobile"
                                    :alt-list="config.altList"
                                ></Card>
                            </li>
                        </ul>
                    </li>
                </ul> <!-- #series-lists -->

                <button
                    id="series-lists-hide"
                    v-if="!listsHidden"
                    @click="listsHidden = true"
                >
                    <p id="series-lists-hide-p">
                        III
                    </p>
                </button>
            </div>

            <!-- Graph and info of selected/expanded series -->
            <div
                id="series-info"
                class="fade-in-up"
                :style="seriesInfoStyle"
                v-if="expanded"
                ref="seriesInfo"
            >
                <!-- Show or hide series lists -->
                <button
                    id="series-lists-toggler"
                    @click="listsHidden = !listsHidden"
                >
                    III
                </button>

                <Loading v-if="!expandedCard"></Loading>

                <template v-else-if="!expandedCard.isNull">
                    <!-- Header (poster, title, date and rating of series) -->
                    <div id="expanded-header">
                        <img id="expanded-poster" :src="expandedCard.poster" :alt="expandedCard.title"/>
                        <h2 id="expanded-title">
                            <a
                                class="black-color"
                                :href="expandedCard.imdbLink"
                                target="_blank"
                                :title="expandedCard.aTitle[lang]"
                            >{{expandedCard.title}}</a>

                            <span class="expanded-title-span">|</span>
                            <span id="expanded-date">{{expandedCard.date}}</span>
                            <span class="expanded-title-span">|</span>
                            <Rating id="expanded-rating" :rating="parseFloat(expandedCard.rating)"></Rating>
                        </h2>
                        <button id="expanded-close" @click="expanded = false">X</button>
                    </div> <!-- #expanded-header -->

                    <!-- Chart and episode info -->
                    <div id="expanded-body">
                        <template v-if="!expandedCard.noRatings">
                            <Chart
                                :eps="chartEps"
                                :expanded-index="expandedEp.index"
                                :lowest-index="expandedCard.lowestEp.index"
                                :range="config.range"
                                :animation="config.animation"
                                @change-ep="expandedEp = expandedCard.episodes[$event]"
                            ></Chart>
                            
                            <Episode
                                v-show="config.showEpisodeInfo"
                                :lang="lang"
                                :info="expandedEp"
                                :series-title="expandedCard.title"
                                :gradient-move="gradientMove"
                                :lowest-index="expandedCard.lowestEp.index"
                                :sorted-eps="expandedCard.sortedEps"
                                :spoilers="config.spoilers"
                                @change-ep="expandedEp = expandedCard.episodes[$event]"
                            ></Episode>
                        </template>
                        <div v-else class="no-info">{{noInfoText[lang]}}</div>
                    </div> <!-- #expanded-body -->
                </template>
                <div v-else class="no-info">{{noInfoText[lang]}}</div>
                
            </div> <!-- #series-info -->

        </main> <!-- #series -->
  </div>
  
</template>

<script>

    import { fadeIn, ratingColor } from '@/variables.js'

    import Loading from './components/Loading.vue'
    import Card from './components/Card.vue'
    import Chart from './components/Chart.vue'
    import Episode from './components/Episode.vue'
    import Rating from './components/Rating.vue'
    import SearchBar from './components/SearchBar.vue'
    import HeaderConfig from './components/HeaderConfig.vue'
    import WarningLang from './components/WarningLang.vue'

    export default {
        name: 'App',

        components: {
            Loading,
            Card,
            Chart,
            Episode,
            Rating,
            SearchBar,
            HeaderConfig,
            WarningLang
        },

        data: function() {
            return {
                onMobile: false,

                docTitle: '', //Stores document.title
                urlParams: null, //Store URLSearchParams
                favLinks: {},
                lastColor: '',

                navButtons: [  //Buttons to show on the header
                    {
                        text: { en: 'Options', es: 'Opciones' },
                        svg: require('./assets/svg/options.svg'),
                        alt: 'Options'
                    },
                    {
                        text: { en: 'About', es: 'Acerca De' },
                        svg: require('./assets/svg/info.svg'),
                        alt: 'Info'
                    }
                ],
                actOption_: -1, //Active header button
                highlightWhy: false, //Highlight a specific part of the 'About' text
                showWarningLang: false, //Show language warning box if language is not English
                supportedLangs: ['en', 'es'], //Languages the website supports
                config: { //Config preferences (changed in 'Options')
                    lang: 'en',
                    range: 0,
                    animation: true,
                    showEpisodeInfo: true,
                    spoilers: true,
                    nulls: true,
                    altList: false
                },

                showSearchResults: false, //Show or hide search results (if search has focus or not)

                noInfoText: { //Text to show when API fails to retrieve info about a series
                    en: 'No info could be found about this series.',
                    es: 'No se encontró información de esta serie.'
                },

                expanded_: false, //If expanded, show a series' info and ratings chart
                expandedCard_: null, //Stores the expanded series' info
                expandedEp_: null, //Stores the expanded series' episode info
                expandedInd: { list: -1, card: -1 }, //List and card index of expanded series
                listsHidden: false, //Show or hide series lists container
                listsLoaded: false, //Card lists loaded (once initial cards are created)
                cardsCount: -1, //Count how many cards were created

                topRatedCards: [ //Series to add to Top Rated list once page loads
                    'breaking+bad',
                    'chernobyl',
                    'the+sopranos',
                    'band+of+brothers',
                    'the+wire',
                    'avatar+the+last+airbender'
                ],
                hallOfShameCards: [ //Series to add to Hall of Shame list once page loads
                    'game+of+thrones',
                    'house+of+cards',
                    'dexter',
                    'lost',
                    'the+walking+dead',
                    'how+i+met+your+mother'
                ],
                
                lists: [ //Series lists
                    { //Series searched by the user
                        name: { en: 'Custom Search', es: 'Series Buscadas' },
                        description: { en: 'Your search history', es: 'Tu historial de búsquedas' },
                        showCards: true, //Show or hide list content (toggled by clicking on the list name)
                        canDelete: true, //Can the user delete cards inside this list?
                        reverse: true, //flex-direction: row-reverse?

                        cards: [] //Cards array
                    },
                    { //Critically acclaimed series
                        name: { en: 'Top Rated', es: 'Las más valoradas' },
                        description: { en: 'Critically acclaimed series', es: 'Series aclamadas por la crítica' },
                        showCards: true,
                        canDelete: false,
                        reverse: false,

                        cards: []
                    },
                    { //Series that went downhill
                        name: { en: 'Hall of Shame', es: 'El Salón de la Infama' },
                        description: { en: 'Popular shows that went downhill', es: 'Shows populares que decayeron' },
                        showCards: true,
                        canDelete: false,
                        reverse: false,

                        cards: []
                    }
                ],
            }
        },

        computed: {
            //Language
            lang: function() { return this.config.lang; },
            //Episodes to show in the chart
            chartEps: function() {
                let eps = this.expandedCard.episodes;
                return (this.config.nulls) ? eps : eps.filter(e => !isNaN(e.rating));
            },

            activeOption: {
                get() { return this.actOption_; },
                set(val) {
                    this.actOption_ = val;
                    if (val === -1) this.highlightWhy = false;
                    else if (this.$refs.warningBox) this.$refs.warningBox.deleted = true;
                }
            },
            //If expanded, show a series' info and ratings chart
            expanded: {
                get() { return this.expanded_; },
                set(val) {
                    this.expanded_ = val;
                    if (!val) { //If it's not expanded anymore, deselect card
                        if (this.expandedInd.list >= 0 && this.expandedInd.card >= 0)
                            this.lists[this.expandedInd.list].cards[this.expandedInd.card].selected = false;
                        this.expandedInd.list = this.expandedInd.card = -1;
                        //Show lists container (because container will go full width)
                        this.listsHidden = false;
                        //Set title back to default, and delete url parameter
                        document.title = this.docTitle;
                        this.urlParams.delete('series');
                        this.updateUrl();
                    }
                }
            },
            //Expanded series' info
            expandedCard: {
                get: function() { return this.expandedCard_; },
                set: function(val) {
                    //If a series was expanded, update info and highlight its lowest-rated episode
                    this.expandedEp = (val) ? val.lowestEp : null;
                    this.expandedCard_ = val;
                    this.expanded = true;
                    //Reset fade in animation
                    let el = this.$refs.seriesInfo;
                    if (el) fadeIn(el);
                }
            },
            //Selected episode of the expanded series
            expandedEp: {
                get: function() { return this.expandedEp_; },
                set: function(val) {
                    if (this.expandedEp_ === val) return;
                    this.expandedEp_ = val;
                }
            },
            //Return the class to apply to all elements with 'gradient' class, depending on the selected episode's rating
            gradientMove: function() {
                let colArray = ['gr-green', 'gr-orange', 'gr-red', 'gr-orange'];
                let col = (this.expandedEp) ? ratingColor(this.expandedEp.rating, colArray) : colArray[0];
                //Update favicon color
                // TODO:
                // if (col != this.lastColor) {
                //     let file = 'img/favicon-' + col.slice().split('-')[1] + '.ico'; 
                //     if (this.favLinks.icon) this.favLinks.icon.href = file;
                //     if (this.favLinks.shortcut) this.favLinks.shortcut.href = file;
                // }
                //Update lastColor and return
                this.lastColor = col;
                return col;
            },

            seriesInfoStyle: function() {
                return {
                    overflow: (this.onMobile && !this.listsHidden) ? 'hidden' : 'scroll'
                };
            },

            seriesContainerStyle: function() {
                return {
                    justifyContent: (this.expanded) ? '' : 'center'
                }
            }
        },

        created: function() {
            window.onresize = this.windowResizeEvent;
            this.windowResizeEvent();
            this.listsHidden = this.onMobile;

            this.docTitle = document.title;
            this.urlParams = new URLSearchParams(window.location.search);
            this.favLinks.icon = document.querySelector("link[rel*='icon']");
            this.favLinks.shortcut = document.querySelector("link[rel='shortcut icon']");
            //Add default cards to arrays
            this.addLoop(this.topRatedCards, 1);
            this.addLoop(this.hallOfShameCards, 2);
            //Detect and apply language
            let applyLang = 'en';
            if (this.urlParams.has('lang')) applyLang = this.urlParams.get('lang')
            else {
                let navLang = (navigator.userLanguage || navigator.language).toLowerCase().split('-')[0];
                applyLang = navLang;
            }
            this.config.lang = (this.supportedLangs.find(l => l === applyLang)) ? applyLang : 'en';
            this.urlParams.set('lang', this.config.lang);
            if (this.config.lang != 'en') this.showWarningLang = true;
            //Expand card if a url parameter exists
            if (this.urlParams.has('series')) {
                let expID = this.urlParams.get('series');
                this.addCard('i=' + expID, 0, true);
            } else if (this.onMobile) {
                this.expandCard({ listIndex: 2, cardIndex: 0 });
            }
            this.updateUrl();
        },

        methods: {
            //When url parameters change, update url
            updateUrl() {
                let params = this.urlParams.toString();

                let url = ''.concat(
                    window.location.protocol,
                    '//',
                    window.location.host,
                    window.location.pathname,
                    (params === '') ? '' : ('?' + params)
                );

                window.history.replaceState({ path: url }, '', url);
            },
            
            //Find the index of a card using the list it's in and the cardID
            findCardIndex(listIndex, cardID) {
                return this.lists[listIndex].cards.findIndex(c => c.cardID === cardID);
            },

            //Add an array of cards to a list
            addLoop(seriesArray, listIndex) {
                for (let i=0; i<seriesArray.length; i++) this.addCard('t=' + seriesArray[i], listIndex);
            },

            //Add a card to a list
            addCard(search, listIndex, expand = false) {
                //If a card with the same series exists in the same list already, just expand that card instead
                let similarCard = this.lists[listIndex].cards.findIndex(c => c.search === search);
                if (similarCard >= 0) {
                    this.expandCard({ listIndex: listIndex, cardIndex: similarCard });
                    return;
                }
                //Add card to array. The 'card' component will take care of gathering its own data
                this.cardsCount++;
                let cardIndex = this.lists[listIndex].cards.length;
                this.lists[listIndex].cards.push(
                    { 
                        cardID: this.cardsCount,
                        search: search,
                        selected: false,

                        vueComponent: null,
                        requestInfo: false,
                        listIndex: listIndex
                    }
                );
                //Show the list in case it was hidden
                this.lists[listIndex].showCards = true;
                //Expand the new card if necessary. The series-info element will display but
                //the card will need to finish loading before actually showing any info.
                if (expand) this.expandCard({ listIndex: listIndex, cardIndex: cardIndex });
            },

            //Stores properties of a card in the list.cards array (called from 'card' component once loaded)
            storeCard(vueComponent) {
                let cardID = vueComponent.cardID;
                let listIndex = vueComponent.listIndex;
                //Store vue component and card data
                let arrayIndex = this.findCardIndex(listIndex, cardID);
                this.lists[listIndex].cards[arrayIndex].vueComponent = vueComponent;
                this.lists[listIndex].cards[arrayIndex].info = vueComponent.appInfo;
                //If it was requested for the card to expand, do it now since it's done loading
                if (this.lists[listIndex].cards[arrayIndex].requestInfo)
                    this.expandCard({ listIndex: listIndex, cardIndex: arrayIndex }, false);
            },

            //Expand a card
            expandCard(card, ignorePrevious = false) {
                //If another card was selected, deselect it
                let exCard = this.expandedInd.card;
                let exList = this.expandedInd.list;
                if (!ignorePrevious && exCard >= 0 && exList >= 0)
                    this.lists[exList].cards[exCard].selected = false;
                //Store the new card's info
                this.expandedCard = this.lists[card.listIndex].cards[card.cardIndex].info;
                //If the info is ready (the card has loaded already)
                if (this.expandedCard) {
                    //Show list in case it was hidden; update title and url parameters
                    this.listsHidden = false;
                    document.title = this.expandedCard.title + ' | ' + this.docTitle;
                    this.urlParams.set('series', this.expandedCard.imdbID);
                    this.updateUrl();
                //If card is not loaded (aka, if it was just created), request to expand once it is
                } else this.lists[card.listIndex].cards[card.cardIndex].requestInfo = true;
                //Select the card and show the list in case it was hidden
                this.lists[card.listIndex].cards[card.cardIndex].selected = true;
                this.lists[card.listIndex].showCards = true;
                this.expandedInd.card = card.cardIndex;
                this.expandedInd.list = card.listIndex;

                if (this.onMobile) this.listsHidden = true;
            },

            //Delete a card
            deleteCard(card) {
                let listCards = this.lists[card.listIndex].cards;
                let index = this.findCardIndex(card.listIndex, card.cardID);
                //If the card was selected, choose a card next to it to select
                if (card.selected) {
                    let newCardInd = 0;
                    let newListInd = 0;
                    let ignorePrevious = false;
                    //If there are more cards in this list, select previous or next one
                    if (listCards.length > 1) {
                        newListInd = card.listIndex;
                        newCardInd = (index > 0) ? (index - 1) : (index + 1);
                    //If this was the only card in the list, select a card from the other lists
                    } else {
                        ignorePrevious = true;
                        let prev = (card.listIndex > 0 && this.lists[card.listIndex - 1].cards.length > 0);
                        newListInd = (prev) ? (card.listIndex - 1) : (card.listIndex + 1);
                        newCardInd = (prev) ? (this.lists[newListInd].cards.length - 2) : 1;
                    }
                    //Expand the chosen card. ignorePrevious = don't deselect previously selected card
                    this.expandCard({ listIndex: newListInd, cardIndex: newCardInd }, ignorePrevious);
                }
                //Remove card from array
                this.lists[card.listIndex].cards.splice(index, 1);
            },

            //Hides search results and config component if they loose their focus
            lostFocus(event) {
                //If user clicked on the search bar or any of its chidlren, show results. Otherwise, hide them.
                if (this.$refs.searchBar.contains(event.target)) this.showSearchResults = true;
                else this.showSearchResults = false;
                //If user clicked on the header buttons or the config component, show config compoentn.
                if (this.activeOption >= 0 && !this.$refs.config.contains(event.target)) {
                    let buttons = this.$refs.navButtons;
                    let clickedButton = false;
                    for (let i = 0; i<buttons.length; i++) {
                        if (buttons[i] === event.target) clickedButton = true;
                    }
                    //Otherwise, hide config component.
                    if (!clickedButton) this.activeOption = -1;
                }
            },

            //Change a config preference. Update url parameters if necessary
            configChange(change) {
                let holdValue =  this.config[change.key];
                this.config[change.key] = change.value
                if (change.key === 'lang' && holdValue != change.value) {
                    this.urlParams.set('lang', change.value);
                    this.updateUrl();
                }
            },

            //Opens the 'About' section and highlights a specific <span></span>
            whyInfoEnglish() {
                this.highlightWhy = true;
                this.activeOption = 1;
            },

            //Check if a card needs to break the flex line (flex-basis: 100%).
            //Only if it's the first card in a list shown in reverse order and the number of cards is odd
            lineBreak(listIndex, index) {
                let list = this.lists[listIndex];
                return (this.expanded && list.reverse && index === 0 && ((list.cards.length-1) % 2 === 0));
            },
            
            clickOnLogo() {
                if (this.onMobile) this.listsHidden = true;
                else this.expanded = false;
            },

            openNavButton(index) {
                this.activeOption = (this.activeOption === index) ? -1 : index
                if (this.activeOption >= 0 && this.onMobile) this.listsHidden = true;
            },

            windowResizeEvent() {
                let prev = this.onMobile;
                this.onMobile = window.innerWidth <= 1080;
                if (this.onMobile && !prev) this.listsHidden = true;
                else if (!this.onMobile && prev) this.listsHidden = false;
            }
        }
    }

</script>

<style lang="scss">
    @import '@/assets/css/partials/_general.scss';
    // @import '@/assets/css/partials/_app.scss';
    @import '@/assets/css/partials/_header.scss';
    @import '@/assets/css/partials/_card.scss';
    @import '@/assets/css/partials/_series-list.scss';
    @import '@/assets/css/partials/_series-info.scss';
    @import '@/assets/css/partials/_keyframes.scss';
</style>