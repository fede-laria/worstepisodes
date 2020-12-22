<template>

    <div class="copy-font">
        <p class="episode-title-p">
            <b>{{sXn}}</b>
            <span v-if="isSpecial">{{specialEpisode[lang]}}</span>
        </p>
        <p class="episode-title-p" style="margin-bottom: 10px">
            <em>{{title}}</em>
        </p>
    </div>

</template>

<script>

    export default {
        name: 'EpisodeTitle',

        props: {
            lang: String,
            sXn: String,
            title: String,
            pilot: Boolean,
            seasonFinale: Boolean,
            seriesFinale: Boolean
        },

        data: function() {
            return {
                pilotText: { en: 'Pilot', es: 'Piloto' },
                seriesFinaleText: { en: 'Series Finale', es: 'Final de Serie' },
                seasonFinaleText: { en: 'Season Finale', es: 'Final de Temporada' }
            }
        },

        computed: {
            isSpecial: function() { return (this.pilot || this.seasonFinale || this.seriesFinale); },
            //Return what kind of special episode it is, if any
            specialEpisode: function() {
                if (this.pilot) return this.pilotText;
                else if (this.seasonFinale) return this.seasonFinaleText;
                else return ((this.seriesFinale) ? this.seriesFinaleText : '');
            }
        }
    }

</script>