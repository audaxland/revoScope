/**
 * A Withdrawal transaction of cryptocurrencies
 */
class Withdrawal
{
    /**
     * @param record {Object} record of a withdrawal
     * @param referenceCurrency {string} name of the local or base currency
     */
    constructor({record, referenceCurrency}) {

        /**
         * @type {string} the key of the cryptocurrency record in IndexDB (the key is made of the date, time and a hash)
         */
        this.cryptoKey = record.key;

        /**
         * Alias of this.cryptoKey
         * @type {string} the key of the cryptocurrency record in IndexDB (the key is made of the date, time and a hash)
         */
        this.key = record.key;

        /**
         * @type {string} currency of the cryptocurrency
         */
        this.currency = record.Currency;

        /**
         * @type {string} name of the local or base currency
         */
        this.referenceCurrency = referenceCurrency;

        /**
         * @type {string} Fiat currency as used in the record to calculate the value of the asset withdrawn
         */
        this.fiatCurrency = record["Base currency"] ?? referenceCurrency;

        /**
         * @type {string} the date and time of the transaction, in the format "YYYY-MM-DD HH:MM:SS"
         */
        this.dateTime = record['Started Date'];

        /**
         * @type {number} timestamp of the record start date, as unix time
         */
        this.time = record.date.getTime();

        /**
         * @type {number} year of the transaction
         */
        this.year = Number(this.dateTime.substring(0, 4));

        /**
         * @type {number} amount of cryptocurrency withdrawn in this transaction
         */
        this.cryptoAmount = Number(record.Amount);

        /**
         * @type {number} value of the asset withdrawn in the fiat currency in this transaction
         */
        this.localAmount = record["Fiat amount"] ? Number(record["Fiat amount"]) : null;

        // in more recent revolut statements, the fee on the cryptocurrency record is actually a currency amount fee
        // whereas on older statements, that fee was a cryptocurrency amount
        if ((record['Base currency'] ?? this.currency) === this.currency) {
            this.cryptoFee = Math.abs(Number(record.Fee));
            this.localFee = 0.0;
        } else {
            this.cryptoFee = 0.0;
            this.localFee = Math.abs(Number(record.Fee));
        }

        /**
         * @type {number} balance of the cryptocurrency as provided in the statement csv file
         */
        this.cryptoBalance = Number(record.Balance);

        /**
         * @type {number} rate used in the transaction to convert the cryptocurrency to the local currency
         */
        this.rateToLocal = ((!!this.localAmount) && (!!this.cryptoAmount)) ? Math.abs(this.localAmount / this.cryptoAmount) : null;

        /**
         * @type {number} rate used in the transaction to convert the local to the cryptocurrency currency
         */
        this.rateToCrypto = ((!!this.localAmount) && (!!this.cryptoAmount)) ?  Math.abs(this.cryptoAmount / this.localAmount) : null;

        /**
         * @type {number} amount fees paid to buy the cryptocurrencies withdrawn, here initialized to 0.0
         */
        this.purchaseFeeValue = 0.0;

        /**
         * @type {number} amount of fee paid to withdraw the cryptocurrency, converted to the local currency
         */
        this.withdrawalFeeValue = this.localFee  + (this.rateToLocal ? this.rateToLocal * this.cryptoFee : 0.0);

        /**
         * @type {number} the price the purchases cost, excluding the fees, here initialized to 0.0
         */
        this.cost = 0.0;

        /**
         * @type {number} amount gain or lost when withdrawing the cryptocurrencies
         */
        this.gain = 0.0;

        /**
         * @type {Object[]} list of purchases info used to buy the assets withdrawn, here initialized to an empty array
         */
        this.purchases = [];

    }

    /**
     * A withdrawal is invalid if there is no corresponding purchases, this can happen if there are missing statements provided by the user
     * @returns {'sale'|'invalidSale'} type either a normal withdrawal or an invalid withdrawal
     */
    type() {
        return this.purchases.length ? 'withdrawal' : 'invalidWithdrawal';
    }

    /**
     * Computed list of details about the withdrawal (this could be done in a cleaner way...)
     * @param extra
     * @returns {{dateTime: *, date: string, cost: *, year: *, rateToCrypto: *, balanceToDate: *, localCurrency: *, type: ("sale"|"invalidSale"), rateToLocal: *, error: *, purchaseFeeValue: *, withdrawalFeeValue: *, gain: *, month: number, cryptoAmount: *, fiatCurrency: *, currency: *, cryptoBalance: *, totalCost: number, localAmount: *}}
     */
    details(extra = {}) {
        const {
            currency,
            referenceCurrency,
            fiatCurrency,
            dateTime,
            year,
            cryptoAmount,
            localAmount,
            rateToLocal,
            rateToCrypto,
            cryptoBalance,
            purchaseFeeValue,
            withdrawalFeeValue,
            cost,
            gain,
            error,
            balanceToDate,
        } = this;

        return {
            type: this.type(),
            currency,
            dateTime,
            date: dateTime.substring(0, 10),
            year: year,
            month: Number(dateTime.substring(5,7)),
            cryptoAmount,
            localAmount,
            localCurrency: referenceCurrency,
            fiatCurrency,
            rateToLocal,
            rateToCrypto,
            cryptoBalance,
            purchaseFeeValue,
            withdrawalFeeValue,
            cost,
            totalCost: this.cost + this.purchaseFeeValue + this.withdrawalFeeValue,
            gain,
            error,
            balanceToDate,
            ...extra
        }
    }

    /**
     * Set the purchase details
     * @param purchases {Object[]} list of purchase details for this withdrawal
     */
    setPurchases(purchases) {
        this.purchases = purchases;
        purchases.forEach(purchase => {
            this.cost += Math.abs(purchase.localAmount);
            this.purchaseFeeValue += purchase.feeValue
        });
        // Not sure if older statements had the fiat amount
        if (this.localAmount) {
            this.gain = Math.abs(this.localAmount) - this.cost - this.purchaseFeeValue - this.withdrawalFeeValue;
        }
    }
}

export default Withdrawal;