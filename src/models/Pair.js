/**
 * A Pair is made of two records, one in the local/base currency and the other in a cryptocurrency
 */
class Pair
{
    /**
     * @param records {[Object, Object]} array of the two records that belong to the pair
     * @param referenceCurrency {string} name of the local or base currency
     * @param matchedBy {string} indicate if the Pair was matched automatically or manually
     */
    constructor({records, referenceCurrency, matchedBy}) {
        /**
         * @type {string} name of the local or base currency
         */
        this.referenceCurrency = referenceCurrency;

        /**
         * @type {string} how the Pair was matched (either 'manual' or 'date-time')
         */
        this.matchedBy = matchedBy;

        /**
         * @type {Object} the record for the local/base currency
         */
        const localRecord = (records[0].Currency === referenceCurrency) ? records[0] : records[1];

        /**
         * @type {Object} the record for the cryptocurrency
         */
        const cryptoRecord = (records[0].Currency === referenceCurrency) ? records[1] : records[0];

        /**
         * @type {string} the key of the local record in IndexDB (the key is made of the date, time and a hash)
         */
        this.localKey = localRecord.key;

        /**
         * @type {string} the key of the cryptocurrency record in IndexDB (the key is made of the date, time and a hash)
         */
        this.cryptoKey = cryptoRecord.key;

        /**
         * @type {string} currency of the cryptocurrency
         */
        this.currency = cryptoRecord.Currency;

        /**
         * @type {string} the date and time of the transaction, in the format "YYYY-MM-DD HH:MM:SS"
         */
        this.dateTime = cryptoRecord['Started Date'];

        /**
         * @type {number} timestamp of the record start date, as unix time
         */
        this.time = cryptoRecord.date.getTime();

        /**
         * @type {number} year of the transaction
         */
        this.year = Number(this.dateTime.substring(0, 4));

        /**
         * @type {number} amount of cryptocurrency bought/sold in this transaction
         */
        this.cryptoAmount = Number(cryptoRecord.Amount);

        /**
         * @type {number} amount of the local/base currency bought/sold in this transaction
         */
        this.localAmount = Number(localRecord.Amount);

        // in more recent revolut statements, the fee on the cryptocurrency record is actually a currency amount fee
        // whereas on older statements, that fee was a cryptocurrency amount
        if (cryptoRecord['Base currency'] === localRecord.Currency) {
            this.cryptoFee = 0.0;
            this.localFee = Number(localRecord.Fee) + Number(cryptoRecord.Fee);
        } else {
            this.cryptoFee = Number(cryptoRecord.Fee);
            this.localFee = Number(localRecord.Fee);
        }

        /**
         * @type {number} balance of the cryptocurrency as provided in the statement csv file
         */
        this.cryptoBalance = Number(cryptoRecord.Balance);

        /**
         * @type {number} rate used in the transaction to convert the cryptocurrency to the local currency
         */
        this.rateToLocal = Math.abs(this.localAmount / this.cryptoAmount);

        /**
         * @type {number} rate used in the transaction to convert the local to the cryptocurrency currency
         */
        this.rateToCrypto = Math.abs(this.cryptoAmount / this.localAmount);
    }

    /**
     * Returns the main details about the pair that we will need later
     * @returns {Object}
     */
    pairDetails() {
        const {
            currency,
            referenceCurrency,
            dateTime,
            year,
            cryptoAmount,
            localAmount,
            rateToLocal,
            rateToCrypto,
            cryptoBalance,
        } = this;
        return {
            currency,
            dateTime,
            date: dateTime.substring(0, 10),
            year: year,
            month: Number(dateTime.substring(5,7)),
            cryptoAmount,
            localAmount,
            localCurrency: referenceCurrency,
            rateToLocal,
            rateToCrypto,
            cryptoBalance,
        }
    }
}

export default Pair;
