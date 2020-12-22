<template>

    <div
        class="card-delete"
        :style="deleteStyle"
        @click="addCount($event)"
    >{{text}}</div>

</template>

<script>

    export default {
        name: 'CardDelete',

        props: {
            lang: String,
            hover: Boolean,
            noRatings: Boolean,
            onMobile: Boolean
        },

        data: function() {
            return {
                clickCount: 0, //First click will work as a warning, second will delete the card
                cHover_: false, //Reset the click counter when mouse leaves card
                deleteText: { en: 'Delete', es: 'Eliminar' },
                confirmText: { en: 'Confirm', es: 'Confirmar' }
            }
        },

        computed: {
            text: function() {
                let text = (this.clickCount === 0) ? this.deleteText : this.confirmText;
                return text[this.lang];
            },
            //Hide if mouse is not over the card. Always show at full opacity if no episodes were found.
            deleteStyle: function() {
                let style = {
                    display: (this.hover || this.noRatings) ? 'block' : ((this.onMobile) ? 'block' : 'none'),
                    fontWeight: (this.clickCount > 0) ? '700' : 'normal',
                };

                if (this.noRatings) style.opacity = 1;
                return style;
            },
            //Reset click counter if mouse leaves container
            containerHover: {
                get() { return this.cHover_; },
                set(val) {
                    this.cHover_ = val;
                    if (!val) this.clickCount = 0;
                }
            }
        },

        methods: {
            //Add to click counter when there's a click. Delete card if counter = 2
            addCount(event) {
                event.stopPropagation();
                this.clickCount++;
                if (this.clickCount === 2) {
                    this.clickCount = 0;
                    this.$emit('delete');
                }
            }
        },

        watch: {
            //If mouse leaves container, reset click counter
            hover: function(val) { if (!val) this.clickCount = 0; }
        }
    }

</script>