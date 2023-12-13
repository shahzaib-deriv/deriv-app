import { useState } from 'react';
import { useCurrencyConfig } from '@deriv/api';

const CURRENCY_TYPE = Object.freeze({
    CRYPTO: 'crypto',
    FIAT: 'fiat',
});

const useCurrencySelectionContext = () => {
    const [currency, setCurrency] = useState('');
    const { data: currencyConfig } = useCurrencyConfig();

    const currencies = Object.values(currencyConfig ?? {});
    const cryptoCurrencies = Array.from(
        currencies.filter(currencyObject => currencyObject.type === CURRENCY_TYPE.CRYPTO)
    );
    const fiatCurrencies = Array.from(currencies.filter(currencyObject => currencyObject.type === CURRENCY_TYPE.FIAT));

    return { cryptoCurrencies, currency, fiatCurrencies, setCurrency };
};

export default useCurrencySelectionContext;
