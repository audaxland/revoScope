

class Pair
{
    constructor({records, referenceCurrency, matchedBy}) {
        this.referenceCurrency = referenceCurrency;
        this.matchedBy = matchedBy;
        const localRecord = (records[0].Currency === referenceCurrency) ? records[0] : records[1];
        const cryptoRecord = (records[0].Currency === referenceCurrency) ? records[1] : records[0];

        this.localKey = localRecord.key;
        this.cryptoKey = cryptoRecord.key;
        this.currency = cryptoRecord.Currency;
        this.dateTime = cryptoRecord['Started Date'];
        this.year = Number(this.dateTime.substring(0, 4));

        this.cryptoAmount = Number(cryptoRecord.Amount);
        this.localAmount = Number(localRecord.Amount);
        this.cryptoFee = Number(cryptoRecord.Fee);
        this.localFee = Number(localRecord.Fee);

        this.cryptoBalance = Number(cryptoRecord.Balance);

        this.rateToLocal = Math.abs(this.localAmount / this.cryptoAmount);
        this.rateToCrypto = Math.abs(this.cryptoAmount / this.localAmount);



    }

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
