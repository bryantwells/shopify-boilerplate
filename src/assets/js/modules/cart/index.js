import Vue from 'vue';
import store from './store';
import { mapActions, mapGetters, mapState } from 'vuex';
import * as currency from '@shopify/theme-currency';

import cartItem from './components/CartItem';
import product from './components/Product';

// Vue.config.runtimeCompiler = true;

export class Cart {
    init() {

        /* ------------------------------------------------------------
            Create Vue instance for the Header. This includes 
            the cart toggle and the cart itself.
        ------------------------------------------------------------ */

        if (document.querySelector('.Header')) {
            new Vue({
                el: '.Header',
                delimiters: ['${', '}'],
                store,
                mounted: function () {
                    this.hydrateCartItems();
                },
                methods: {
                    ...mapActions('cart', [
                        'hydrateCartItems',
                        'toggleDrawerCart',
                    ]),
                    formatMoney(price) {
                        return currency.formatMoney(price);
                    },
                },
                computed: {
                    ...mapState('cart', {
                        checkoutUrl: state => state.checkoutUrl,
                        drawerCartIsOpen: state => state.drawerCartIsOpen,
                    }),
                    ...mapGetters('cart', [
                        'cartCount',
                        'cartSubtotal',
                    ]),
                },
                components: {
                    cartItem
                }
            })
        }

        /* ------------------------------------------------------------
            Create Vue instance for any element with a .u-vue class,
            allowing for access to vuex store and methods.
            (For example, the product page)
        ------------------------------------------------------------ */

        if (document.querySelector('.u-vue')) {
            new Vue({
                el: '.u-vue',
                delimiters: ['${', '}'],
                store,
                mounted: function () {
                    this.hydrateCartItems();
                },
                methods: {
                    ...mapActions('cart', [
                        'hydrateCartItems',
                        'removeCartItem',
                        'toggleDrawerCart',
                        'addCartItem',
                    ]),
                    formatMoney(price) {
                        return currency.formatMoney(price);
                    },
                    resizeShopifyImageUrl(url, size) {
                        return resizeShopifyImageUrl(url, size);
                    },
                },
                computed: mapGetters('cart', [
                    'cartSubtotal',
                ]),
                components: {
                    product
                }
            });
        }
    }
}