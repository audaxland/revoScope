import Purchase from "./Purchase";
import Sale from "./Sale";

/**
 * The Account instance contains all the purchases and sales of a given cryptocurrency asset
 * and maps the sales to their corresponding purchases, as a first in first out method
 * allowing to calculate the gains/losses on each sale, as well as tracking the balance
 */
class Account
{
    /**
     * Initiates the Account instance
     * @param currency {string} currency of the Account (e.g. BTC)
     * @param referenceCurrency {string} local or base currency the assets were bought and sold (e.g. EUR)
     */
    constructor({currency, referenceCurrency}) {
        /**
         * @type {string} cryptocurrency of the account
         */
        this.currency = currency;

        /**
         * @type {string} local or base currency
         */
        this.referenceCurrency = referenceCurrency;

        /**
         * @type {Purchase[]} list of all the purchases of this cryptocurrency
         */
        this.purchases = [];

        /**
         * @type {Sale[]} list of all the sales of this cryptocurrency
         */
        this.sales = [];

        /**
         * @type {number} index of the oldest purchase that has not yet been sold
         */
        this.cursor = 0;

        /**
         * @type {number} total amount of the cryptocurrency purchased
         */
        this.purchased = 0.0;

        /**
         * @type {number} total amount of the cryptocurrency sold
         */
        this.sold = 0.0;
    }

    /**
     * Add a new Pair (purchase or sale transaction) to the account
     * @param pair {Pair} Pair instance to add
     */
    addPair(pair) {
        // if the pair is a purchase
        if (pair.cryptoAmount > 0) {
            const purchase = new Purchase(pair);
            this.purchased += purchase.purchased;
            purchase.balanceToDate = this.purchased - this.sold ;
            this.purchases.push(purchase);
        }

        // if the pair is a sale
        if (pair.cryptoAmount < 0) {
            const sale = new Sale(pair);
            try {
                // for sales, the crypto amount excludes the fee, so the fee must be added
                const {purchases, cursor} = this.matchSaleToPurchases(Math.abs(pair.cryptoAmount) + pair.cryptoFee);
                sale.setPurchases(purchases);
                purchases.forEach(purchase => {
                    this.purchases[purchase.purchaseId].remaining = purchase.remainingAfter;
                });
                this.cursor = cursor;
                // for sales, the fee is excluded from the amount
                this.sold += sale.sold;
            } catch (saleError) {
                // if there are missing transactions in the app, it is possible that a sale would not have any corresponding purchase
                // in which case it is an error, and the user must figure out what statement files are missing
                sale.error = saleError?.message ?? saleError;
            }
            sale.balanceToDate = this.purchased - this.sold ;
            this.sales.push(sale);
        }
    }

    /**
     * computes what purchases corresponds to a sale
     * @param matchAmount {Number} amount of the cryptocurrency that was sold
     * @returns {{cursor: number, purchases: Object[]}}
     *          cursor: new cursor after purchase is processed
     *          purchases: list of purchases, just the general information about the purchases
     */
    matchSaleToPurchases (matchAmount) {
        let cursor = this.cursor;
        let loopAmount = matchAmount;
        // float numbers are not exact, so floatIncertitude is used to ignore small differences due to float approximations
        const floatIncertitude = loopAmount / 1000000000;
        const purchases = [];

        // find all the purchases needed to match the amount of the sale
        while (loopAmount > floatIncertitude) {
            if (cursor >= this.purchases.length) {
                throw new Error('Missing purchase');
            }
            const remainingBefore = this.purchases[cursor].remaining;
            const remainingAfter = Math.abs(remainingBefore - loopAmount) < floatIncertitude ? 0.0 : remainingBefore - loopAmount;

            // if the purchase being read is the last one for this sale...
            if (remainingAfter > 0.0) {
                const prorateRatio = loopAmount / this.purchases[cursor].purchased;
                purchases.push({
                    purchaseId: cursor,
                    amount: loopAmount,
                    remainingAfter: remainingAfter,
                    date: this.purchases[cursor].pair.dateTime.substring(0,10),
                    localAmount: this.purchases[cursor].pair.localAmount * prorateRatio,
                    feeValue: this.purchases[cursor].purchaseFeeValue * prorateRatio,
                });
                loopAmount = 0;
            } else {
                const prorateRatio = remainingBefore / this.purchases[cursor].purchased;
                purchases.push({
                    purchaseId: cursor,
                    amount: remainingBefore,
                    remainingAfter: 0.0,
                    date: this.purchases[cursor].pair.dateTime.substring(0,10),
                    localAmount: this.purchases[cursor].pair.localAmount * prorateRatio,
                    feeValue: this.purchases[cursor].purchaseFeeValue * prorateRatio,
                });
                loopAmount -= remainingBefore;
                cursor++;
            }
        }

        return { purchases, cursor };
    }

    /**
     * generate a list of all purchases and sales, this is rendered on the "Transactions" page
     * @returns {Object[]} list of purchases
     */
    listTransactions() {
        return [
            ...this.purchases.map((purchase, index) => purchase.details({index})),
            ...this.sales.map((sale, index) => sale.details({index}))
        ].map(row => ({...row, 'balanceValue': (row.cryptoBalance * row.rateToLocal).toFixed(2)}));
    }

    /**
     * Empty data for a year summary, the year data os rendered on the "Accounts" page
     * @param firstItem {Object} the first purchase or sale of assets of the currency, this is used to set the defaults
     * @returns {Object}
     */
    yearTemplate(firstItem) {
        return {
            currency: this.currency,
            year: firstItem.pair.year,
            purchases: 0,
            sales: 0,
            salesInvalid: 0,
            purchased: 0.0,
            purchasedFor: 0.0,
            sold: 0.0,
            soldFor: 0.0,
            soldInvalid: 0.0,
            soldInvalidFor: 0.0,
            lastDate: firstItem.pair.dateTime,
            lastBalance: firstItem.pair.cryptoBalance,
            lastBalanceValue: firstItem.pair.cryptoBalance * firstItem.pair.rateToLocal,
            maxBalance : firstItem.pair.cryptoBalance,
            maxBalanceValue: firstItem.pair.cryptoBalance * firstItem.pair.rateToLocal,
            minRate: firstItem.pair.rateToLocal,
            maxRate: firstItem.pair.rateToLocal,
            gain: 0.0,
            totalFeesValue: 0.0,
        }
    }

    /**
     * Generate the summary of the cryptocurrencies purchases and sales by year
     * @returns {Object}
     */
    summary() {
        const years = {};

        this.purchases.forEach(purchase => {
            if (!years[purchase.pair.year]) {
                years[purchase.pair.year] = this.yearTemplate(purchase);
            }
            years[purchase.pair.year].purchases += 1;
            years[purchase.pair.year].purchased += purchase.purchased;
            years[purchase.pair.year].purchasedFor += Math.abs(purchase.pair.localAmount);
            years[purchase.pair.year].totalFeesValue += purchase.purchaseFeeValue;

            // the balanceValue is the cryptocurrency balance converted to the local/reference currency
            const balanceValue = purchase.pair.cryptoBalance * purchase.pair.rateToLocal;

            // get the last balance of the year
            if (purchase.pair.dateTime > years[purchase.pair.year].lastDate) {
                years[purchase.pair.year].lastDate = purchase.pair.dateTime;
                years[purchase.pair.year].lastBalance = purchase.pair.cryptoBalance;
                years[purchase.pair.year].lastBalanceValue = balanceValue;
            }

            // get the highest balance of cryptocurrencies
            if (years[purchase.pair.year].maxBalance < purchase.pair.cryptoBalance) {
                years[purchase.pair.year].maxBalance = purchase.pair.cryptoBalance;
            }

            // get the highest balance value, converted in the local/reference currency
            if (years[purchase.pair.year].maxBalanceValue <balanceValue) {
                years[purchase.pair.year].maxBalance = balanceValue;
            }

            // get the lowest exchange rate used in the year
            if (years[purchase.pair.year].minRate > purchase.pair.rateToLocal) {
                years[purchase.pair.year].minRate = purchase.pair.rateToLocal
            }

            // get the highest exchange rate used in the year
            if (years[purchase.pair.year].maxRate < purchase.pair.rateToLocal) {
                years[purchase.pair.year].maxRate = purchase.pair.rateToLocal
            }
        })

        this.sales.forEach(sale => {
            if (!years[sale.pair.year]) {
                years[sale.pair.year] = this.yearTemplate(sale);
            }

            // an invalid sale is a sale that did not have a corresponding purchase
            // this happens when there are missing statement files, only the user can correct this
            // by providing the corresponding statement files
            if (sale.type() === 'invalidSale') {
                years[sale.pair.year].salesInvalid += 1;
                years[sale.pair.year].soldInvalid += Math.abs(sale.sold);
                years[sale.pair.year].soldInvalidFor += Math.abs(sale.pair.localAmount);
            } else {
                years[sale.pair.year].sales += 1;
                years[sale.pair.year].sold += Math.abs(sale.sold);
                years[sale.pair.year].soldFor += Math.abs(sale.pair.localAmount);
                years[sale.pair.year].gain += sale.gain;
                years[sale.pair.year].totalFeesValue += sale.purchaseFeeValue + sale.saleFeeValue;
            }

            // the balanceValue is the cryptocurrency balance converted to the local/reference currency
            const balanceValue = sale.pair.cryptoBalance * sale.pair.rateToLocal;

            // get the last balance of the year
            if (sale.pair.dateTime > years[sale.pair.year].lastDate) {
                years[sale.pair.year].lastDate = sale.pair.dateTime;
                years[sale.pair.year].lastBalance = sale.pair.cryptoBalance;
                years[sale.pair.year].lastBalanceValue = balanceValue;
            }

            // get the highest balance of cryptocurrencies
            if (years[sale.pair.year].maxBalance < sale.pair.cryptoBalance) {
                years[sale.pair.year].maxBalance = sale.pair.cryptoBalance;
            }

            // get the highest balance value, converted in the local/reference currency
            if (years[sale.pair.year].maxBalanceValue <balanceValue) {
                years[sale.pair.year].maxBalance = balanceValue;
            }

            if (years[sale.pair.year].minRate > sale.pair.rateToLocal) {
                years[sale.pair.year].minRate = sale.pair.rateToLocal
            }
            if (years[sale.pair.year].maxRate < sale.pair.rateToLocal) {
                years[sale.pair.year].maxRate = sale.pair.rateToLocal
            }
        })

        return years;
    }

    /**
     * Generate the list of sales, with or without the corresponding purchases
     * @param withPurchases {boolean} if set to true, the output will include a row per purchase, if false, only the sale are returned
     * @returns {*[]}
     */
    listSales(withPurchases = true) {
        const salesList = [];
        this.sales.forEach((sale, id) => {
            const saleDetails = {
                id,
                type: sale.type(),
                sold: sale.sold,
                soldFor: sale.pair.localAmount,
                ...sale.pair.pairDetails(),
                purchaseFeeValue: sale.purchaseFeeValue,
                saleFeeValue: sale.saleFeeValue,
                cost: sale.cost,
                totalCost: sale.cost + sale.purchaseFeeValue + sale.saleFeeValue,
                gain: sale.gain,
                purchases: sale.purchases.length,
                purchaseDates: [...sale.purchases.reduce((prev, {date}) => prev.add(date), new Set())],
            }

            // if we are including the purchases, we generate a row per purchase, all rows contain the dales data
            if (withPurchases) {
                sale.purchases.forEach(({purchaseId, amount, localAmount, feeValue}, purchaseIndex) => {
                    const purchase = this.purchases[purchaseId];
                    salesList.push({
                        ...saleDetails,
                        purchaseIndex,
                        purchaseItemDateTime: purchase.pair.dateTime,
                        purchaseItemAmount: amount,
                        purchaseItemFor: Math.abs(localAmount),
                        purchaseItemFeeValue: feeValue,
                    });
                });
            } else {
                salesList.push(saleDetails);
            }
        })
        return salesList;
    }
}

export default Account;
