import Vue from 'vue';
import resizeShopifyImageUrl from '../helpers/resize-shopify-image-url';
import * as currency from '@shopify/theme-currency';
import { mapActions } from 'vuex';

/* ------------------------------------------------------------
    Cart Item - Vue Component
    ---
    Used as an inline-template within our app instance.
    Holds local state for the cart item functionality and 
    enables interacting with the vuex store.
------------------------------------------------------------ */

export default Vue.component('cart-item', {
    props: {
        item: Object,
        index: Number,
    },
    data() {
        return {
            quantity: this.item.quantity,
            feedbackMessage: '',
            subscriptionData: {},
            isPendingAction: false,
        };
    },
    mounted: function () { },
    methods: {
        ...mapActions('cart', [
            'removeCartItem', 
            'changeCartItem'
        ]),

        // Change Quantity
        changeQuantity(newQuantity) {
            if (newQuantity >= 1) {
                this.isPendingAction = true;
                console.log('pending action')
                this.changeCartItem({
                    line: this.index + 1,
                    quantity: Number(newQuantity),
                })
                    .then((response) => { 
                        window.setTimeout(() => {
                            this.isPendingAction = false;
                        }, 500);
                        console.log(response);
                    })
                    .catch(error => {
                        // On error show the error message under the cart item.
                        this.feedbackMessage = error;
                        window.setTimeout(() => {
                            this.feedbackMessage = '';
                        }, 3000);
                        console.log(this.feedbackMessage);
                    });
            }
        },

        // Format Money
        formatMoney(price) {
            return currency.formatMoney(price);
        },

        // Resize Shopify Image URL
        resizeShopifyImageUrl(url, size) {
            return resizeShopifyImageUrl(url, size);
        },
    },
    watch: {
        // Watch for item quantity changes and set them in local state.
        // Need to watch because the main item itself won't be reactive 
        // if it is already in the cart. We need to react to its 
        // deep property for quantity.
        item: {
            handler: function (val) {
                this.quantity = val.quantity;
            },
            deep: true,
        },
    },
});