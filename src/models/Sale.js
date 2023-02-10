/**
 * A sale transaction of cryptocurrencies
 */
class Sale
{
    /**
     * @param pair {Pair} original Pair instance of the sale
     */
    constructor(pair) {
        /**
         * @type {Pair} original Pair instance of the sale
         */
        this.pair = pair;

        /**
         * Note, in older statements the fee was given in the cryptocurrency and added to the sale amount
         * and in more recent statements, the fee is given in the base currency, in which case pair.cryptoFee = 0.0
         * @type {number} amount sold
         */
        this.sold = Math.abs(pair.cryptoAmount) +  pair.cryptoFee;

        /**
         * @type {number} amount fees paid to buy the cryptocurrencies sold, here initialized to 0.0
         */
        this.purchaseFeeValue = 0.0;

        /**
         * @type {number} amount of fee paid to sell the cryptocurrency, converted to the local currency
         */
        this.saleFeeValue = pair.localFee + (pair.rateToLocal * pair.cryptoFee);

        /**
         * @type {number} the price the purchases cost, excluding the fees, here initialized to 0.0
         */
        this.cost = 0.0;

        /**
         * @type {number} amount gain or lost when selling the cryptocurrencies
         */
        this.gain = 0.0;

        /**
         * @type {Object[]} list of purchases info used to buy the assets sold, here initialized to an empty array
         */
        this.purchases = [];
    }

    /**
     * A sale is invalid if there is no corresponding purchases, this can happen if there are missing statements provided by the user
     * @returns {'sale'|'invalidSale'} type either a normal sale or an invalid sale
     */
    type() {
        return this.purchases.length ? 'sale' : 'invalidSale';
    }

    /**
     * Set the purchase details
     * @param purchases {Object[]} list of purchase details for this sale
     */
    setPurchases(purchases) {
        this.purchases = purchases;
        purchases.forEach(purchase => {
            this.cost += Math.abs(purchase.localAmount);
            this.purchaseFeeValue += purchase.feeValue
        });
        this.gain = this.pair.localAmount - this.cost - this.purchaseFeeValue - this.saleFeeValue;
    }

    /**
     * Generate a summary of the sale
     * @param extra {object} optional additional fields to add to the output
     * @returns {Object}
     */
    details(extra = {}) {
        const {sold, purchaseFeeValue, saleFeeValue, cost, gain, error} = this;
        return {
            type: this.type(),
            ...this.pair.pairDetails(),
            balanceToDate: this.balanceToDate,
            purchased: 0.0,
            sold,
            purchaseFeeValue,
            saleFeeValue,
            cost,
            gain,
            error,
            ...extra
        };
    }
}

export default Sale;
