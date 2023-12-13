import React from 'react';
import classNames from 'classnames';
import useDevice from '../../hooks/useDevice';
import BtcIcon from '../../public/images/currencies/btc.svg';
import { WalletButton, WalletText } from '../Base';
import useCurrencySelectionContext from './useCurrencySelectionContext';
import './CurrencySelection.scss';

const CurrencySelection = () => {
    const { isDesktop, isMobile } = useDevice();
    const { cryptoCurrencies, currency, fiatCurrencies, setCurrency } = useCurrencySelectionContext();

    return (
        <div className='currency-selection--container'>
            <div className='currency-selection--content'>
                {isDesktop && (
                    <WalletText as='div' size='md' weight='bold'>
                        Select your preferred currency
                    </WalletText>
                )}
                <div className='currency-selection--currencies'>
                    <WalletText align='center' as='div' size='md' weight='bold'>
                        Fiat Currencies
                    </WalletText>
                    <div className='currency-selection--currencies-list'>
                        {fiatCurrencies.map(fiatCurrency => {
                            return (
                                <div
                                    className={classNames('currency-selection--currencies-currency', {
                                        'currency-selection--currencies-currency-selected':
                                            fiatCurrency.code === currency,
                                    })}
                                    key={fiatCurrency.code}
                                    onClick={() => setCurrency(fiatCurrency.code)}
                                >
                                    <BtcIcon />
                                </div>
                            );
                        })}
                    </div>
                    <WalletText align='center' size='sm'>
                        You are limited to one fiat account. You won’t be able to change your account currency if you
                        have already made your first deposit or created a real Deriv MT5 or Deriv X account.
                    </WalletText>
                </div>
                <div className='currency-selection--border-bottom' />
                <div className='currency-selection--currencies'>
                    <WalletText align='center' as='div' size='md' weight='bold'>
                        Cryptocurrencies
                    </WalletText>
                    <div className='currency-selection--currencies-list'>
                        {cryptoCurrencies.map(cryptoCurrency => {
                            return (
                                <div
                                    className={classNames('currency-selection--currencies-currency', {
                                        'currency-selection--currencies-currency-selected':
                                            cryptoCurrency.code === currency,
                                    })}
                                    key={cryptoCurrency.code}
                                    onClick={() => setCurrency(cryptoCurrency.code)}
                                >
                                    <BtcIcon />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className='currency-selection--footer currency-selection--border-top'>
                <WalletButton disabled={!currency} isFullWidth={isMobile} size='lg'>
                    Next
                </WalletButton>
            </div>
        </div>
    );
};

export default CurrencySelection;
