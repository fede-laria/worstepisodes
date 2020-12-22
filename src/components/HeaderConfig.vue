<template>
    
<div id="header-config">
    
    <div v-show="loaded" class="fade-in" ref="config">

        <ul
            v-if="activeOption === 0"
            class="config-ul"
        >

            <li
                v-for="(cf, index) in configList"
                :key="index"
                class="config-li"
            >
                <p class="config-title">{{cf.title[lang]}}</p>

                <select
                    v-if="cf.type === 'select'"
                    class="config-select"
                    v-model="cf.model"
                    @change="$emit('config-change', { key: cf.key, value: cf.model })"
                >
                    <option
                        v-for="(option, index) in cf.options"
                        :key="index"
                        :value="option.value"
                    >{{option.title[lang]}}</option>
                </select>

                <div v-else class="config-checkbox">
                    <input
                        type="checkbox"
                        :id="'checkbox' + index"
                        class="config-input"
                        v-model="cf.model"
                        @change="$emit('config-change', { key: cf.key, value: cf.model })"
                    />
                    <label :for="'checkbox' + index" class="config-label">
                        <span v-if="cf.model">{{cf.label[0][lang]}}</span>
                        <span v-else>{{cf.label[1][lang]}}</span>
                    </label>
                </div>

                <div
                    v-if="cf.key === 'lang' && cf.model === 'es'"
                    class="config-warning copy-font fade-in"
                >
                    <p class="config-warning-p">
                        La información de las series se mostrará en inglés.
                    </p>
                    <button
                        class="config-warning-button"
                        @click="aboutScroll()"
                    >¿Por qué?</button>
                </div>
            </li>

        </ul>


        <ul
            v-else
            class="about-ul"
            ref="about"
        >

            <li
                v-for="(text, index) in aboutTexts"
                :key="index"
            >

                <h4 class="about-title">{{text.title[lang]}}</h4>
                <p class="about-p">
                    <span v-html="text.text[lang]"></span>
                    <template v-if="text.highlight">
                        <br>
                        <span :class="{ 'about-highlight': highlightWhy }">
                            {{text.highlight[lang]}}
                        </span>
                    </template>
                </p>

            </li>

            <li>
                <p class="about-p about-imdb">
                    Information courtesy of IMDb.<br>
                    (http://www.imdb.com).<br>
                    Used with permission.
                </p>
            </li>

        </ul>

    </div>

</div>

</template>

<script>

    import { fadeIn } from '@/variables.js'

    export default {
        name: 'HeaderConfig',

        props: {
            lang: String,
            activeOption: Number,
            config: Object,
            highlightWhy: Boolean
        },

        data: function() {
            return {
                loaded: false,
                configList: [ //User preferences list ('Options')
                    { //Change language
                        key: 'lang', //The key needs to match the one in 'config' array
                        title: { en: 'Language', es: 'Idioma' },
                        type: 'select', //Type of HTML element
                        model: 'en', //v-model to store the selected value
                        options: [ //<option> elements inside <select>
                            {
                                title: { en: 'English', es: 'English' },
                                value: 'en'
                            },
                            {
                                title: { en: 'Español', es: 'Español' },
                                value: 'es'
                            }
                        ]
                    },
                    { //Change chart range (min and max values)
                        key: 'range',
                        title: { en: 'Chart Range', es: 'Rango del Gráfico' },
                        type: 'select',
                        model: 0,
                        options: [
                            {
                                title: { en: '0 to 10', es: 'Del 0 al 10' },
                                value: 0
                            },
                            {
                                title: { en: 'Lowest to Highest', es: 'Más bajo al más alto' },
                                value: 1
                            }
                        ]
                    },
                    { //Enable of disable chart animations when values change
                        key: 'animation',
                        title: { en: 'Chart Animation', es: 'Animar Gráfico' },
                        type: 'checkbox',
                        model: true,
                        label: [ //Label element for the checkbox (instead of <option>)
                            { en: 'Enabled', es: 'Animar' },
                            { en: 'Disabled', es: 'No Animar' }
                        ]
                    },
                    { //Show or hide selected episode info
                        key: 'showEpisodeInfo',
                        title: { en: 'Episode Info', es: 'Info del Episodio' },
                        type: 'checkbox',
                        model: true,
                        label: [
                            { en: 'Show', es: 'Mostrar' },
                            { en: 'Hide', es: 'Ocultar' }
                        ]
                    },
                    { //If enabled, blur episode plots in order to avoid possible spoilers
                        key: 'spoilers',
                        title: { en: 'Blur Episode Plots', es: 'Ocultar Tramas' },
                        type: 'checkbox',
                        model: true,
                        label: [
                            { en: 'Enabled', es: 'Activado' },
                            { en: 'Disabled', es: 'Desactivado' }
                        ]
                    },
                    {
                        key: 'nulls',
                        title: { en: 'Null Episodes', es: 'Episodios Faltantes' },
                        type: 'checkbox',
                        model: true,
                        label: [
                            { en: 'Show', es: 'Mostrar' },
                            { en: 'Hide', es: 'Ocultar' }
                        ]
                    },
                    {
                        key: 'altList',
                        title: { en: 'Compact List', es: 'Lista Compacta' },
                        type: 'checkbox',
                        model: false,
                        label: [
                            { en: 'Enabled', es: 'Activado' },
                            { en: 'Disabled', es: 'Desactivado' }
                        ]
                    }
                ]
            }
        },

        computed: {
            //'About' <p> elements
            aboutTexts: function() {
                let behance = 'behance.net/fedelaria';
                let img = 'reddit.com/r/dataisbeautiful/comments/fqqzki/worst_episode_ever_the_most_commonly_rated_shows/';
                let aTitles = {
                    imdb: { en: 'Go to IMDB', es: 'Ir a IMDB' },
                    omdb: { en: 'Go to OMDB API', es: 'Ir a OMDB API' },
                    tmdb: { en: 'Go to TMDB API', es: 'Ir a TMDB API' },
                    chartJs: { en: 'Go to ChartJs.org', es: 'Ir a ChartJs.org' },
                    vueJs: { en: 'Go to VueJs.org', es: 'Ir a VueJs.org' },
                    github: { en: "Go to this project's Github page", es: 'Ir a la página de Github de este proyecto' },
                };
                //Generate <a> tag
                let aTag = function(text, link, title, www = true) {
                    return '<a class="a-about" href="https://' + ((www) ? 'www.' : '') + link
                        + '" title="' + title + '" target="_blank">' + text + '</a>';
                };
                //Links used in 'About' texts
                let links = { 
                    enBeh: aTag('My Behance profile.', behance, 'My Behance profile'),
                    esBeh: aTag('Mi perfil en Behance.', behance, 'Mi perfil en Behance'),
                    enImg: aTag('image', img, 'Go to the Reddit post that inspired this project'),
                    esImg: aTag('imagen', img, 'Ir al post de Reddit que inspiró este proyecto'),
                    imdb: aTag('IMDB', 'imdb.com', aTitles.imdb[this.lang]),
                    omdb: aTag('OMDB', 'omdbapi.com/', aTitles.omdb[this.lang]),
                    tmdb: aTag('TMDB', 'developers.themoviedb.org/3', aTitles.tmdb[this.lang], false),
                    chartJs: aTag('Chart.js', 'chartjs.org/', aTitles.chartJs[this.lang]),
                    vueJs: aTag('Vue.js', 'vuejs.org/', aTitles.vueJs[this.lang]),
                    github: aTag('Github', 'github.com/fede-laria/worst-episodes', aTitles.github[this.lang])
                };
                //aboutTexts
                return [
                    {
                        title: { en: 'About Me', es: 'Sobre Mí' },
                        text: {
                            en: `
                                Hi! &#9749 I'm Federico Laria, graphic designer with
                                front-end knowledge from Buenos Aires, Argentina. 
                                <br>
                            ` + links.enBeh,
                            es: `
                                ¡Hola! &#9749 Soy Federico Laria, diseñador gráfico con
                                conocimientos de maquetado web de Buenos Aires, Argentina.
                                <br>
                            ` + links.esBeh
                        }
                    },
                    {
                        title: { en: 'About The Project', es: 'Sobre El Projecto' },
                        text: {
                            en: `
                                I came across an ` + links.enImg + ` showing the episode ratings of
                                different popular shows, highlighting their lowest point.
                                Inspired by this, I decided to take the idea one step further
                                while also practicing my front-end skills.
                                <br>
                                Additionally, I was interested in learning how to work with an
                                API, and this was the perfect opportunity to do so.
                            `,
                            es: `
                                Me crucé con una ` + links.esImg + ` que mostraba el puntaje de cada episodio
                                de varias series populares, destacando sus puntos más bajos.
                                Habiéndome inspirado, quise llevar la idea un paso más adelante
                                y, al mismo tiempo, practicar mis habilidades de maquetado web.
                                <br>
                                También estaba interesado en aprender a trabajar con una API y
                                ésta era la oportunidad perfecta para hacerlo.
                            `
                        }
                    },
                    {
                        title: { en: 'How does it work?', es: '¿Cómo funciona?' },
                        text: {
                            en: `
                                The website gets the episodes' info from ` + links.imdb + ` using the `
                                + links.omdb + ` and ` + links.tmdb + ` API's, it stores all the ratings and
                                displays a graphic with ` + links.chartJs + `, highlighting the lowest-rated episode.
                                <br>
                                Powered by ` + links.vueJs + `
                                <br>
                                Check out the project on ` + links.github + `.
                            `,
                            es: `
                                La página consigue la información de los episodios de ` + links.imdb + ` usando
                                las API de ` + links.omdb + ` y ` + links.tmdb + `, almacena los puntajes y los muestra
                                en un gráfico con ` + links.chartJs + `, destacando el episodio peor valorado.
                                <br>
                                Desarrollado con ` + links.vueJs + `
                                <br>
                                El proyecto está subido a ` + links.github + `.
                            `
                        }
                    },
                    {
                        title: { en: 'Limitations', es: 'Limitaciones' },
                        highlight: {
                            en: `
                                Lastly, the API only retrieves information in English, so the data will always
                                be shown in that language regardless of the user's preference.
                            `,
                            es: `
                                Por último, la API sólo devuelve la información en inglés, por lo que siempre
                                se mostrarán los datos en este idioma, sin importar las preferencias del usuario.
                            `
                        },
                        text: {
                            en: `
                                Lamely, the project doesn't come without its downsides. There are
                                two big problems with the main API (OMDB): it has a limited amount
                                of calls per day, and a lot of data is outdated or missing. The
                                site tries to fix the latter issue by using a second API (TMDB)
                                and getting the data from that one instead, but it's not always possible.
                                That's why you'll see a lot of episodes marked as 'null'.
                                <br>
                                IMDB doesn't have an official public API and it forbids web scraping,
                                so OMDB seems to be the only viable choice, for the time being.
                            `,
                            es: `
                                Lamentablemente, el proyecto tiene sus desventajas. Hay dos problemas
                                grandes con la API principal (OMDB): tiene un límite de 'llamados' por día,
                                y mucha de la información está desactualizada o faltante. La página intenta
                                arreglar esto último usando una segunda API (TMDB) en la que conseguir la
                                información, pero no siempre funciona. Por esa razón, habrán episodios
                                se muestran como 'vacíos'.
                                <br>
                                IMDB no tiene una API oficial y pública, y prohibe el uso de 'web scraping',
                                así que OMDB parecer ser la única opción, por el momento.
                            `
                        }
                    }
                ];
            }
        },

        methods: {
            aboutScroll() {
                setTimeout(() => { this.$emit('why'); }, 100);
            }
        },

        mounted() {
            this.loaded = false;
            //Match local config values with 'config' prop values
            let cf = Object.entries(this.config)
            for (let i = 0; i < cf.length; i++) {
                let index = this.configList.findIndex(list => list.key === cf[i][0]);
                this.configList[index].model = cf[i][1];
            }
            this.loaded = true;
        },

        watch: {
            //Reset fade-in animation if an option is selected
            activeOption: {
                immediate: true,
                handler(val, oldVal) {
                    if (val >= 0 || val != oldVal) {
                        let el = this.$refs.config;
                        if (el) fadeIn(el);

                        if (this.highlightWhy) {
                            setTimeout(() => this.$refs.about.scrollTo({
                                top: this.$refs.about.scrollHeight,
                                behavior: 'smooth'
                            }), 50);
                        }
                    }
                }
            }
        }
    }

</script>

// TODO: Separar textos en archivo de variables e importar