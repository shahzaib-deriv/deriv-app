import React from 'react';
import classNames from 'classnames';
import { getCurrencyDisplayCode } from '../../../../shared/src/utils/currency';
import useDevice from '../../hooks/useDevice';
import AudIcon from '../../public/images/currency-selection/aud.svg';
import BtcIcon from '../../public/images/currency-selection/btc.svg';
import EthIcon from '../../public/images/currency-selection/eth.svg';
import EurIcon from '../../public/images/currency-selection/eur.svg';
import EusdtIcon from '../../public/images/currency-selection/eusdt.svg';
import GbpIcon from '../../public/images/currency-selection/gbp.svg';
import LtcIcon from '../../public/images/currency-selection/ltc.svg';
import TusdtIcon from '../../public/images/currency-selection/tusdt.svg';
import UnknownIcon from '../../public/images/currency-selection/unknown.svg';
import UsdIcon from '../../public/images/currency-selection/usd.svg';
import UsdcIcon from '../../public/images/currency-selection/usdc.svg';
import UstIcon from '../../public/images/currency-selection/ust.svg';
import { WalletButton, WalletText } from '../Base';
import useCurrencySelectionContext from './useCurrencySelectionContext';
import './CurrencySelection.scss';

type TCurrencyIcon = {
    currencyCode: string;
};

const CurrencyIcon = ({ currencyCode }: TCurrencyIcon) => {
    switch (currencyCode.toLowerCase()) {
        case 'aud':
            return <AudIcon />;
        case 'eur':
            return <EurIcon />;
        case 'gbp':
            return <GbpIcon />;
        case 'usd':
            return <UsdIcon />;
        case 'btc':
            return <BtcIcon />;
        case 'eth':
            return <EthIcon />;
        case 'ltc':
            return <LtcIcon />;
        case 'usdc':
            return <UsdcIcon />;
        case 'ust':
            return <UstIcon />;
        case 'eusdt':
            return <EusdtIcon />;
        case 'tusdt':
            return <TusdtIcon />;
        default:
            return <UnknownIcon />;
    }
};

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
                {currencyLists.map((currencyList, index) => {
                    return (
                        <div className='currency-selection--currencies' key={index}>
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
                                        <button
                                            className={classNames('currency-selection--currencies-currency', {
                                                'currency-selection--currencies-currency-selected':
                                                    currencyListItem.code === currency,
                                            })}
                                            key={currencyListItem.code}
                                            onClick={() => setCurrency(currencyListItem.code)}
                                        >
                                            <div className='currency-selection--currencies-icon'>
                                                <CurrencyIcon currencyCode={currencyListItem.code} />
                                            </div>
                                            <div>
                                                <WalletText align='center' size='sm'>
                                                    {currencyListItem?.name}
                                                </WalletText>
                                                <WalletText align='center' size='sm'>
                                                    ({getCurrencyDisplayCode(currencyListItem.code)})
                                                </WalletText>
                                            </div>
                                        </button>
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
