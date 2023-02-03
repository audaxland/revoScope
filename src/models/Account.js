import Purchase from "./Purchase";
import Sale from "./Sale";

class Account
{
    constructor({currency, referenceCurrency}) {
        this.currency = currency;
        this.referenceCurrency = referenceCurrency;
        this.purchases = [];
        this.sales = [];
        this.cursor = 0;
        this.purchased = 0.0;
        this.sold = 0.0;
    }

    addPair(pair) {
        if (pair.cryptoAmount > 0) {
            const purchase = new Purchase(pair);
            this.purchased += purchase.purchased;
            purchase.balanceToDate = this.purchased - this.sold ;
            this.purchases.push(purchase);
        }
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
                sale.error = saleError?.message ?? saleError;
            }
            sale.balanceToDate = this.purchased - this.sold ;
            this.sales.push(sale);
        }
    }

    matchSaleToPurchases (matchAmount) {
        let cursor = this.cursor;
        let loopAmount = matchAmount;
        // float numbers are not exact, so floatIncertitude is used to ignore small differences due to float approximations
        const floatIncertitude = loopAmount / 1000000000;
        const purchases = [];

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

    listTransactions() {
        return [
            ...this.purchases.map((purchase, index) => purchase.details({index})),
            ...this.sales.map((sale, index) => sale.details({index}))
        ].map(row => ({...row, 'balanceValue': (row.cryptoBalance * row.rateToLocal).toFixed(2)}));
    }

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
            minRate: firstItem.pair.rateToLocal,
            maxRate: firstItem.pair.rateToLocal,
            gain: 0.0,
            totalFeesValue: 0.0,
        }
    }

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
            if (purchase.pair.dateTime > years[purchase.pair.year].lastDate) {
                years[purchase.pair.year].lastDate = purchase.pair.dateTime;
                years[purchase.pair.year].lastBalance = purchase.pair.cryptoBalance;
                years[purchase.pair.year].lastBalanceValue = purchase.pair.cryptoBalance * purchase.pair.rateToLocal;
            }
            if (years[purchase.pair.year].minRate > purchase.pair.rateToLocal) {
                years[purchase.pair.year].minRate = purchase.pair.rateToLocal
            }
            if (years[purchase.pair.year].maxRate < purchase.pair.rateToLocal) {
                years[purchase.pair.year].maxRate = purchase.pair.rateToLocal
            }
        })

        this.sales.forEach(sale => {
            if (!years[sale.pair.year]) {
                years[sale.pair.year] = this.yearTemplate(sale);
            }

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

            if (sale.pair.dateTime > years[sale.pair.year].lastDate) {
                years[sale.pair.year].lastDate = sale.pair.dateTime;
                years[sale.pair.year].lastBalance = sale.pair.cryptoBalance;
                years[sale.pair.year].lastBalanceValue = sale.pair.cryptoBalance * sale.pair.rateToLocal;
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
