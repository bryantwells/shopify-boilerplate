import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

import { axiosShopifyPostConfig } from './config';
import eachSeries from 'async/eachSeries';

Vue.use(Vuex);

/* ------------------------------------------------------------
    Vuex Store
------------------------------------------------------------ */

export default new Vuex.Store({
    modules: {
        cart: {
            namespaced: true,
            state: {
                cartItems: [],
                drawerCartIsOpen: false,
            },

            /* ------------------------------------------------------------
                Getters:
                https://vuex.vuejs.org/guide/getters.html
            ------------------------------------------------------------ */

            getters: {

                /**
                 * Cart Subtotal
                 */
                cartSubtotal(state) {
                    // Save each items total price (unit x quantity) in an array. 
                    // Then reduce the array down to get the total price.
                    // Price will be returned in cents. 
                    // Need to use a money formatter to adjust in the liquid template.
                    return state.cartItems
                        .map(item => {
                            return item.price * item.quantity;
                        })
                        .reduce((a, b) => a + b, 0);
                },

                /**
                 * Cart Count
                 */
                cartCount(state) {
                    // Save each items quantity in an array. 
                    // Then reduce the array down to get the total quantity.
                    return state.cartItems
                        .map(item => {
                            return item.quantity;
                        })
                        .reduce((a, b) => a + b, 0);
                },
            },

            /* ------------------------------------------------------------
                Mutations:
                https://vuex.vuejs.org/guide/mutations.html
            ------------------------------------------------------------ */

            mutations: {

                /**
                 * Set Cart Items
                 * ---
                 * @param {array} newCartItems - Array of cart items. Should be passed in 
                 * the same format as returned from the Shopify api.
                 */
                setCartItems(state, newCartItems) {
                    state.cartItems = newCartItems;
                },

                /**
                 * Toggle Mini Cart
                 */
                toggleDrawerCart(state) {
                    state.drawerCartIsOpen = !state.drawerCartIsOpen;
                    if (state.drawerCartIsOpen) {
                        document.body.classList.add('u-noScroll');
                    } else {
                        document.body.classList.remove('u-noScroll');
                    }
                },
            },

            /* ------------------------------------------------------------
                Actions:
                https://vuex.vuejs.org/guide/actions.html
            ------------------------------------------------------------ */

            actions: {

                /**
                 * Hydrate Cart Items
                 * Refresh the list of items in a users cart from the Shopify api.
                 * Set the cart items in store.
                 */
                hydrateCartItems({ commit }) {
                    axios.get('/cart.js').then(function (response) {
                        const cartData = response.data;
                        const cartItems = cartData.items;
                        commit('setCartItems', cartItems);
                    });
                },

                /**
                 * Remove Cart Item
                 * ---
                 * @param {int} lineItem - The 1 based index of the item in the 
                 * cart that we are removing.
                 */
                removeCartItem({ dispatch, commit }, lineItem) {
                    axios
                        .post(
                            '/cart/change.js',
                            { line: lineItem, quantity: 0 },
                            axiosShopifyPostConfig
                        )
                        .then(function (response) {
                            dispatch('hydrateCartItems');
                        });
                },

                /**
                 * Add Cart Item
                 * ---
                 * @param {object} productData - Pass the quantity and variant id 
                 * of the product in a single object. { id: '', quantity: ''}
                 */
                addCartItem({ dispatch, commit }, productData) {
                    return new Promise((resolve, reject) => {
                        axios
                            .post('/cart/add.js', productData, axiosShopifyPostConfig)
                            .then(response => {
                                dispatch('hydrateCartItems');
                                resolve(response);
                            })
                            .catch(error => {
                                // Could not add product to cart. 
                                // Likely because no more product in stock.
                                reject(error.response.data.description);
                            });
                    });
                },

                /**
                 * Add Cart Items
                 * ---
                 * @param {array} products - Array of products to add to cart. 
                 * Each array item is formatted as { id: '', quantity: ''}
                 * @resolve {array} errors - If there were any errors when adding 
                 * products to cart then those will be passed back to the function 
                 * that called it.
                 */
                addCartItems({ dispatch, commit }, products) {
                    return new Promise((resolve, reject) => {
                        let cartErrors = [];
                        eachSeries(
                            products,
                            (product, callback) => {
                                axios
                                    .post('/cart/add.js', product, axiosShopifyPostConfig)
                                    .then(response => {
                                        callback();
                                    })
                                    .catch(error => {
                                        // Could not add product to cart. 
                                        // Likely because no more product in stock.
                                        cartErrors.push(error.response.data.description);
                                        callback();
                                    });
                            },
                            () => {
                                // Refresh the cart with the products that have been added.
                                dispatch('hydrateCartItems');
                                // Resolve with any errors that occurred in the 
                                // synchronous operations.
                                resolve(cartErrors);
                            }
                        );
                    });
                },

                /**
                 * Change Cart Item
                 * ---
                 * @param {object} productData - Pass the line item id and quantity of
                 * the product in a single object. {line: number, quantity: Number}
                 */
                changeCartItem({ dispatch, commit }, productData) {
                    return new Promise((resolve, reject) => {
                        axios
                            .post('/cart/change.js', productData, axiosShopifyPostConfig)
                            .then(response => {
                                dispatch('hydrateCartItems');
                                resolve(response);
                            })
                            .catch(error => {
                                // Could not add product to cart. 
                                // Likely because no more product in stock.
                                reject(error.response.data.description);
                            });
                    });
                },

                /**
                 * Toggle Mini Cart
                 */
                toggleDrawerCart({ commit }) {
                    commit('toggleDrawerCart');
                },
            },            
        },
    },
});
