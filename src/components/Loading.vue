<template>

    <div class="loading">
        <img
            :style="imgStyle"
            src="@/assets/svg/loading.svg"
        />
    </div>

</template>

<script>

    export default {
        name: 'Loading',

        props: {
            size: String
        },

        computed: {
            imgStyle: function() {
                return {
                    opacity: 0.1,
                    height: this.size,
                    width: this.size,
                    animation: 'loading 1s infinite',
                };
            }
        }
    }
    
</script>