<template>
    
    <div id="chart-container" class="fade-in" style="overflow: auto">
        <canvas id="canvas" height="250" width="700" ref="canvas"></canvas>
    </div>

</template>

<script>

    import { drawChart, updateChart } from '@/chart.js'
    import { fadeIn } from '@/variables.js'

    export default {
        name: 'Chart',

        props: {
            eps: Array,
            expandedIndex: Number,
            lowestIndex: Number,
            range: Number,
            animation: Boolean
        },

        computed: {
            seasons: function() { return this.eps.map(e => e.season); },
            labels: function() { return this.eps.map(e => e.sXn + ' ' + e.title); },
            ratings: function() { return this.eps.map(e => e.rating); }
        },

        methods: {
            //If user clicks on an episode, show that episode's info
            clickEpisode: function(ind) { this.$emit('change-ep', ind) },
            //Redraw the chart
            drawChart: function() {
                fadeIn(this.$el);
                
                drawChart(
                    this,
                    this.$refs.canvas,
                    this.ratings,
                    this.labels,
                    this.seasons,
                    this.lowestIndex,
                    this.range,
                    this.animation
                );
            }
        },

        mounted() { this.drawChart(); },

        watch: {
            //If episodes changed, redraw chart
            eps: function(val) { if (val) this.drawChart(); },
            //If user changed the highlighed episode, update chart
            expandedIndex: function(val, oldVal) { if (val != oldVal) updateChart(); },
            //If user changes the 'Chart Range' config, redraw chart
            range: function(val, oldVal) { if (val != oldVal) this.drawChart(); },
        }
    }

</script>