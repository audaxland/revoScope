class Sale
{
    constructor(pair) {
        this.pair = pair;
        this.sold = Math.abs(pair.cryptoAmount) +  pair.cryptoFee;
        this.purchaseFeeValue = 0.0;
        this.saleFeeValue = pair.localFee + (pair.rateToLocal * pair.cryptoFee);
        this.cost = 0.0;
        this.gain = 0.0;
        this.purchases = [];
    }

    type() {
        return this.purchases.length ? 'sale' : 'invalidSale';
    }

    setPurchases(purchases) {
        this.purchases = purchases;
        purchases.forEach(purchase => {
            this.cost += Math.abs(purchase.localAmount);
            this.purchaseFeeValue += purchase.feeValue
        });
        this.gain = this.pair.localAmount - this.cost - this.purchaseFeeValue - this.saleFeeValue;
    }

    details(extra = {}) {
        const {sold, purchaseFeeValue, saleFeeValue, cost, gain} = this;
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
            ...extra
        };
    }
}

export default Sale;
