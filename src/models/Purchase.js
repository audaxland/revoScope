class Purchase
{
    constructor(pair) {
        this.pair = pair;
        this.purchased = pair.cryptoAmount - pair.cryptoFee; // for purchases, crypto Amount includes the fee
        this.remaining = this.purchased;
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
            ...extra
        };
    }
}

export default Purchase;
