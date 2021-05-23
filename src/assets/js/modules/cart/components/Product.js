import Vue from 'vue';
import { mapState, mapActions } from 'vuex';

/* ------------------------------------------------------------
    Product - Vue Component
    ---
    Used as an inline-template within our app instance.
    Holds local state for the add to cart functionality and 
    enables interacting with the vuex store.
------------------------------------------------------------ */

export default Vue.component('product', {
    data() {
        return {
            activeVariant: {
                id: null,
                isAvaiable: null,
            },
            addToCartStatus: 'idle',
            quantity: 1,
            feedbackMessage: null,
        };
    },
    computed: {
        ...mapState('cart', {
            drawerCartIsOpen: state => state.drawerCartIsOpen,
        }),
    },
    methods: {

        ...mapActions('cart', [
            'toggleDrawerCart',
        ]),

        // Increment Quantity
        incrementQuantity() {
            this.quantity++;
        },

        // Decrement Quantity
        decrementQuantity() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },

        // Add Product To Cart
        addCartItem() {

            // Set the add to cart loading status
            this.addToCartStatus = 'loading';

            // Send the product to the cart
            const productData = { 
                id: this.activeVariant.id, 
                quantity: this.quantity };
            this.$store
                .dispatch('cart/addCartItem', productData)
                .then(() => {

                    // On success indicate it and show the drawer cart.
                    this.addToCartStatus = 'done';
                    this.toggleDrawerCart();
                    window.setTimeout(() => {
                        this.addToCartStatus = 'idle';
                    }, 2000);
                })
                .catch(error => {

                    // On error show the error message on the page
                    this.feedbackMessage = error;
                    this.addToCartStatus = 'idle';
                    window.setTimeout(() => {
                        this.feedbackMessage = null;
                    }, 3000);
                });
        },
    },
});
