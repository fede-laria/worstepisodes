<template>
    
    <div
        :class="{ 'warning-red': redBox, 'warning-deleted': deleted }"
        class="warning-container"
    >
        <p
            class="warning-es-p"
        >La información de las series se mostrará en inglés.</p>

        <button
            class="warning-es-button"
            @click="explainWhy()"
        >¿Por qué?</button>

        <button
            class="warning-es-button"
            @click="deleted = true"
        >X</button>

        <div class="warning-progress">
            <div
                class="warning-progress-white"
                :class="{ 'warning-progress-done': deleting }"
                :style="styleProgress"
            ></div>
        </div>
    </div>

</template>

<script>

    import { fadeIn } from '@/variables.js'

    export default {
        name: 'WarningLang',

        props: {
            redBox: Boolean,
            deleteSelf: Number
        },

        data: function() {
            return {
                deleting: false,
                deleted: false,
                deleteTimeout: null,
                styleProgress: { transition: 'width ' + (this.deleteSelf/1000) + 's' }
            }
        },

        methods: {
            explainWhy() {
                this.deleted = true;
                clearTimeout(this.deleteTimeout);
                this.$emit('why');
            }
        },

        mounted() {
            fadeIn(this.$el);
            if (this.deleteSelf > 0)
                this.deleteTimeout = setTimeout(() => {
                    this.deleting = true;
                    setTimeout(() => this.deleted = true, this.deleteSelf);
                }, 2000);
        }
    }

</script>