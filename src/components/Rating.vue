<template>

    <h2 :style="color">{{showRating}}</h2>

</template>

<script>

    import { ratingColor, green, orange, red } from '@/variables.js'

    export default {
        name: 'Rating',

        props: {
            rating: Number
        },

        computed: {
            //Show the rating, or a question mark if rating is null
            showRating: function() { return (!isNaN(this.rating) ? this.decimal : '?') },
            //Show rating with one decimal
            decimal: function() { return (this.rating % 1 === 0) ? (this.rating + '.0') : this.rating; },
            //Apply right color
            color: function() { return { color: ratingColor(this.rating, [green, orange, red, 'rgb(60, 60, 60)']) }; }
        }
    }

</script>