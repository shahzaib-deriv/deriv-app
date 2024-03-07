import React, { memo } from 'react';
import { Form, Formik } from 'formik';
import { twMerge } from 'tailwind-merge';
import { TCurrencyConfig } from '@/hooks/useCurrencies';
import CurrencyCard from '@/screens/CurrencySelector/CurrencyCard';
import { useActiveTradingAccount, useAuthorize } from '@deriv/api-v2';
import { Button, InlineMessage, Text, useDevice } from '@deriv-com/ui';

type TCurrenciesForm = {
    addedFiatCurrency?: TCurrencyConfig;
    allCryptoCurrenciesAreAdded?: boolean;
    currencies: TCurrencyConfig[];
    currentAccountCurrency?: TCurrencyConfig;
    isSubmitButtonDisabled?: boolean;
    submitButtonLabel?: string;
};

/**
 * @name CurrenciesForm
 * @description The CurrenciesForm component is used to display the currencies form.
 * @param {TCurrenciesForm} props - The props of the component.
 * @param {TCurrencyConfig[]} props.currencies - The currencies to display.
 * @param {boolean} props.isSubmitButtonDisabled - The isSubmitButtonDisabled prop is a boolean that determines if the submit button is disabled.
 * @param {boolean} props.allCryptoCurrenciesAreAdded - The allCryptoCurrenciesAreAdded prop is a boolean that determines if all the cryptocurrencies are added.
 * @param {boolean} props.isFiatCurrencyAdded - The isFiatCurrencyAdded prop is a boolean that determines if the fiat currency is added.
 * @param {string} props.submitButtonLabel - The label for the submit button.
 * @returns {React.ReactNode}
 */
const CurrenciesForm = ({
    currencies,
    submitButtonLabel,
    isSubmitButtonDisabled = false,
    allCryptoCurrenciesAreAdded = false,
    currentAccountCurrency,
    addedFiatCurrency,
}: TCurrenciesForm) => {
    const { isDesktop } = useDevice();
    const { switchCurrency } = useAuthorize();
    const { data: activeTradingAccountData } = useActiveTradingAccount();

    const balance = activeTradingAccountData?.balance;
    const disableFiatCurrencies =
        (!!addedFiatCurrency && currentAccountCurrency?.type !== 'fiat') ||
        (!!balance && currentAccountCurrency?.type === 'fiat');

    const initialValues = {
        currency: '',
    };

    const handleChangeCurrency = async (values: typeof initialValues) => {
        switchCurrency(values.currency);
    };

    return (
        <Formik initialValues={initialValues} onSubmit={handleChangeCurrency}>
            {({ values, isSubmitting }) => (
                <Form className='flex flex-col items-center justify-between h-full min-h-0 py-16 lg:px-16 lg:p-24'>
                    <div
                        className={twMerge(
                            'overflow-y-auto flex flex-wrap justify-start w-full lg:w-[80%]',
                            currencies?.length < 4 ? 'lg:justify-center' : ''
                        )}
                    >
                        {allCryptoCurrenciesAreAdded && (
                            <InlineMessage className='mx-16 bg-opacity-16 bg-status-light-warning lg:mx-0'>
                                <Text align='center' as='p' className='w-full text-sm'>
                                    You already have an account for each of the cryptocurrencies available on Deriv.
                                </Text>
                            </InlineMessage>
                        )}
                        {disableFiatCurrencies && (
                            <InlineMessage className='mx-16 bg-opacity-16 bg-status-light-warning lg:mx-0'>
                                <Text align='center' as='p' className='w-full text-sm'>
                                    {balance
                                        ? `If you want to change your account currency, please contact us via live chat.`
                                        : `Please switch to your ${addedFiatCurrency?.id} account to change currencies.`}
                                </Text>
                            </InlineMessage>
                        )}
                        {currencies.map(currency => (
                            <CurrencyCard
                                className='flex flex-col justify-center'
                                id={currency?.id ?? ''}
                                isDisabled={currency?.isAdded || disableFiatCurrencies}
                                key={currency?.id}
                                title={currency?.name ?? ''}
                            />
                        ))}
                    </div>
                    <div className='flex items-center justify-end w-full px-16 pt-24 border-t border-solid border-t-system-light-secondary-background lg:px-0'>
                        <Button
                            disabled={isSubmitButtonDisabled || !values.currency || isSubmitting}
                            isFullWidth={!isDesktop}
                            isLoading={isSubmitting}
                            type='submit'
                        >
                            {submitButtonLabel ?? 'Add account'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default memo(CurrenciesForm);
