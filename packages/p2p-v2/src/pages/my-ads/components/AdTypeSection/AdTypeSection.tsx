import React, { MouseEventHandler } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { RadioGroup } from '@/components';
import { BUY_SELL, RATE_TYPE } from '@/constants';
import { useQueryString } from '@/hooks';
import { Text, useDevice } from '@deriv-com/ui';
import { AdFormController } from '../AdFormController';
import { AdFormInput } from '../AdFormInput';
import { AdFormTextArea } from '../AdFormTextArea';
import './AdTypeSection.scss';

type TAdTypeSectionProps = {
    currency: string;
    getCurrentStep: () => number;
    getTotalSteps: () => number;
    goToNextStep: MouseEventHandler<HTMLButtonElement>;
    goToPreviousStep: MouseEventHandler<HTMLButtonElement>;
    localCurrency?: string;
    onCancel: () => void;
    rateType: string;
};

const AdTypeSection = ({ currency, localCurrency, onCancel, rateType, ...props }: TAdTypeSectionProps) => {
    const { queryString } = useQueryString();
    const { advertId = '' } = queryString;
    const isEdit = !!advertId;
    const { isMobile } = useDevice();
    const {
        control,
        formState: { isValid },
        getValues,
        setValue,
        trigger,
        watch,
    } = useFormContext();

    const isSell = watch('ad-type') === BUY_SELL.SELL;

    const onChangeAdTypeHandler = (userInput: 'buy' | 'sell') => {
        setValue('ad-type', userInput);
        setValue('payment-method', []);
        if (rateType === RATE_TYPE.FLOAT) {
            if (userInput === BUY_SELL.SELL) {
                setValue('rate-value', '+0.01');
            } else {
                setValue('rate-value', '-0.01');
            }
        }
    };

    const triggerValidation = (fieldNames: string[]) => {
        // Loop through the provided field names
        fieldNames.forEach(fieldName => {
            // Check if the field has a value
            if (getValues(fieldName)) {
                // Trigger validation for the field
                trigger(fieldName);
            }
        });
    };

    return (
        <div className='p2p-v2-ad-type-section'>
            {!isEdit && (
                <Controller
                    control={control}
                    defaultValue={BUY_SELL.BUY}
                    name='ad-type'
                    render={({ field: { onChange, value } }) => {
                        return (
                            <div className='mb-[3.5rem]'>
                                <RadioGroup
                                    name='type'
                                    onToggle={event => {
                                        onChangeAdTypeHandler(event.target.value as 'buy' | 'sell');
                                        onChange(event);
                                    }}
                                    required
                                    selected={value}
                                    textSize={isMobile ? 'md' : 'sm'}
                                >
                                    <RadioGroup.Item label='Buy USD' value={BUY_SELL.BUY} />
                                    <RadioGroup.Item label='Sell USD' value={BUY_SELL.SELL} />
                                </RadioGroup>
                            </div>
                        );
                    }}
                    rules={{ required: true }}
                />
            )}
            <div className='flex flex-col lg:flex-row lg:gap-[1.6rem]'>
                <AdFormInput
                    isDisabled={isEdit}
                    label='Total amount'
                    name='amount'
                    rightPlaceholder={<Text color='less-prominent'>{currency}</Text>}
                    triggerValidationFunction={() => triggerValidation(['min-order', 'max-order'])}
                />
                {/* TODO: Add FLOATING type component */}
                <AdFormInput
                    label='Fixed rate'
                    name='rate-value'
                    rightPlaceholder={<Text color='less-prominent'>{localCurrency}</Text>}
                />
            </div>
            <div className='flex flex-col lg:flex-row lg:gap-[1.6rem]'>
                <AdFormInput
                    label='Min order'
                    name='min-order'
                    rightPlaceholder={<Text color='less-prominent'>{currency}</Text>}
                    triggerValidationFunction={() => triggerValidation(['amount', 'max-order'])}
                />
                <AdFormInput
                    label='Max order'
                    name='max-order'
                    rightPlaceholder={<Text color='less-prominent'>{currency}</Text>}
                    triggerValidationFunction={() => triggerValidation(['amount', 'min-order'])}
                />
            </div>
            {isSell && (
                <AdFormTextArea field='Contact details' label='Your contact details' name='contact-details' required />
            )}
            <AdFormTextArea
                field='Instructions'
                hint='This information will be visible to everyone'
                label='Instructions(optional)'
                name='instructions'
            />
            <AdFormController {...props} isNextButtonDisabled={!isValid} onCancel={onCancel} />
        </div>
    );
};

export default AdTypeSection;
