import React from 'react';
import classNames from 'classnames';
import { getCurrencyDisplayCode } from '../../../../shared/src/utils/currency';
import useDevice from '../../hooks/useDevice';
import BtcIcon from '../../public/images/currency-selection/btc.svg';
import { WalletButton, WalletText } from '../Base';
import useCurrencySelectionContext from './useCurrencySelectionContext';
import './CurrencySelection.scss';

const CurrencySelection = () => {
    const { isDesktop, isMobile } = useDevice();
    const { currency, currencyLists, setCurrency } = useCurrencySelectionContext();

    return (
        <div className='currency-selection--container'>
            <div className='currency-selection--content'>
                {isDesktop && (
                    <WalletText as='div' size='md' weight='bold'>
                        Select your preferred currency
                    </WalletText>
                )}
                {currencyLists.map(currencyList => {
                    return (
                        <div className='currency-selection--currencies' key={currencyList.at(0)?.code}>
                            <WalletText align='center' as='div' size='md' weight='bold'>
                                {currencyList
                                    .at(0)
                                    ?.type.substring(0, 1)
                                    .toLocaleUpperCase()
                                    .concat(currencyList.at(0)?.type.substring(1) ?? '')
                                    .concat(' ')}
                                Currencies
                            </WalletText>
                            <div className='currency-selection--currencies-list'>
                                {currencyList.map(currencyListItem => {
                                    return (
                                        <div
                                            className={classNames('currency-selection--currencies-currency', {
                                                'currency-selection--currencies-currency-selected':
                                                    currencyListItem.code === currency,
                                            })}
                                            key={currencyListItem.code}
                                            onClick={() => setCurrency(currencyListItem.code)}
                                        >
                                            <div>
                                                <BtcIcon />
                                            </div>
                                            <WalletText align='center' size='sm'>
                                                {currencyListItem?.name}
                                            </WalletText>
                                            <WalletText align='center' size='sm'>
                                                ({getCurrencyDisplayCode(currencyListItem.code)})
                                            </WalletText>
                                        </div>
                                    );
                                })}
                            </div>
                            <WalletText align='center' size='sm'>
                                You are limited to one fiat account. You won’t be able to change your account currency
                                if you have already made your first deposit or created a real Deriv MT5 or Deriv X
                                account.
                            </WalletText>
                            <div className='currency-selection--border-bottom' />
                        </div>
                    );
                })}
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
