/**
 * A purchase transaction of a cryptocurrency
 */
class Purchase
{
    /**
     * @param pair {Pair} Pair instance corresponding to this purchase
     */
    constructor(pair) {
        /**
         * @type {Pair} the pair with the details about the purchase
         */
        this.pair = pair;

        /**
         * for purchases, crypto Amount includes the fee in older statements, in newer statement the cryptoFee here is 0.0
         * @type {number} Amount of the cryptocurrency purchase
         */
        this.purchased = pair.cryptoAmount - pair.cryptoFee;

        /**
         * @type {number} Amount of this sale that has not yet been sold
         */
        this.remaining = this.purchased;

        /**
         * @type {number} total fees paid to purchase the amount, converted to the local/base currency
         */
        this.purchaseFeeValue = pair.localFee + (pair.rateToLocal * pair.cryptoFee);
    }

    details(extra = {}) {
        return {
            type: 'purchase',
            ...this.pair.pairDetails(),
            balanceToDate: this.balanceToDate,
            purchased: this.purchased,
            sold: 0.0,
            purchaseFeeValue: this.purchaseFeeValue,
            saleFeeValue: 0.0,
            cost: 0.0,
            gain: 0.0,
            error: '', // there can be errors on sales, so use an empty error here to generate compatible formats
            ...extra
        };
    }
}

export default Purchase;
