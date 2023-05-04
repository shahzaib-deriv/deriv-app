import React from 'react';
import { Field } from 'formik';
import classNames from 'classnames';
import {
    Autocomplete,
    Checkbox,
    Dropdown,
    DesktopWrapper,
    MobileWrapper,
    DateOfBirthPicker,
    Input,
    Popover,
    RadioGroup,
    SelectNative,
    Text,
} from '@deriv/components';
import { getLegalEntityName, isDesktop, isMobile, routes, toMoment, validPhone } from '@deriv/shared';
import { Localize, localize } from '@deriv/translations';
import FormSubHeader from 'Components/form-sub-header';
import PoiNameDobExample from 'Assets/ic-poi-name-dob-example.svg';
import InlineNoteWithIcon from 'Components/inline-note-with-icon';
import FormBodySection from 'Components/form-body-section';
import { Link } from 'react-router-dom';
import { getEmploymentStatusList } from 'Sections/Assessment/FinancialAssessment/financial-information-list';

const DateOfBirthField = props => (
    <Field name={props.name}>
        {({ field: { value }, form: { setFieldValue, errors, touched, setTouched } }) => (
            <DateOfBirthPicker
                error={touched.date_of_birth && errors.date_of_birth}
                onBlur={() =>
                    setTouched({
                        ...touched,
                        date_of_birth: true,
                    })
                }
                onChange={({ target }) =>
                    setFieldValue(
                        'date_of_birth',
                        target?.value ? toMoment(target.value).format('YYYY-MM-DD') : '',
                        true
                    )
                }
                value={value}
                portal_id={props.portal_id}
                {...props}
            />
        )}
    </Field>
);

const FormInputField = ({ name, optional = false, warn, ...props }) => (
    <Field name={name}>
        {({ field, form: { errors, touched } }) => (
            <Input
                type='text'
                required={!optional}
                name={name}
                autoComplete='off'
                maxLength={props.maxLength || 30}
                error={touched[field.name] && errors[field.name]}
                warn={warn}
                {...field}
                {...props}
            />
        )}
    </Field>
);

const PersonalDetailsForm = ({
    errors,
    touched,
    values,
    setFieldValue,
    handleChange,
    handleBlur,
    warning_items,
    setFieldTouched,
    ...props
}) => {
    const {
        is_virtual,
        is_mf,
        is_svg,
        is_qualified_for_idv,
        is_appstore,
        disabled_items,
        has_real_account,
        residence_list,
        is_fully_authenticated,
        account_opening_reason_list,
        closeRealAccountSignup,
        salutation_list,
        is_rendered_for_onfido,
        should_close_tooltip,
        setShouldCloseTooltip,
    } = props;
    const autocomplete_value = 'none';
    const PoiNameDobExampleIcon = PoiNameDobExample;

    const [is_tax_residence_popover_open, setIsTaxResidencePopoverOpen] = React.useState(false);
    const [is_tin_popover_open, setIsTinPopoverOpen] = React.useState(false);

    React.useEffect(() => {
        if (should_close_tooltip) {
            handleToolTipStatus();
            setShouldCloseTooltip(false);
        }
    }, [should_close_tooltip]);

    const getLastNameLabel = () => {
        if (is_appstore) return localize('Family name*');
        return is_svg || is_mf ? localize('Last name*') : localize('Last name');
    };

    const getFieldHint = field_name => {
        return (
            <Localize
                i18n_default_text={
                    is_qualified_for_idv || is_rendered_for_onfido
                        ? 'Your {{ field_name }} as in your identity document'
                        : 'Please enter your {{ field_name }} as in your official identity documents.'
                }
                values={{ field_name }}
            />
        );
    };

    const handleToolTipStatus = () => {
        if (is_tax_residence_popover_open) {
            setIsTaxResidencePopoverOpen(false);
        }
        if (is_tin_popover_open) {
            setIsTinPopoverOpen(false);
        }
    };

    const name_dob_clarification_message = (
        <Localize
            i18n_default_text='To avoid delays, enter your <0>name</0> and <0>date of birth</0> exactly as they appear on your identity document.'
            components={[<strong key={0} />]}
        />
    );

    return (
        <div className={classNames({ 'account-form__poi-confirm-example': is_qualified_for_idv })}>
            {!is_qualified_for_idv ||
                (is_rendered_for_onfido && (
                    <InlineNoteWithIcon
                        message={name_dob_clarification_message}
                        font_size={isMobile() ? 'xxxs' : 'xs'}
                    />
                ))}
            <FormBodySection
                has_side_note={is_qualified_for_idv || is_rendered_for_onfido}
                side_note={<PoiNameDobExampleIcon />}
            >
                <fieldset className='account-form__fieldset'>
                    {'salutation' in values && (
                        <div>
                            <Text size={isMobile() ? 'xs' : 'xxs'} align={isMobile() && 'center'}>
                                {is_virtual ? (
                                    localize(
                                        'Please remember that it is your responsibility to keep your answers accurate and up to date. You can update your personal details at any time in your account settings.'
                                    )
                                ) : (
                                    <Localize
                                        i18n_default_text='Please remember that it is your responsibility to keep your answers accurate and up to date. You can update your personal details at any time in your <0>account settings</0>.'
                                        components={[
                                            <Link
                                                to={routes.personal_details}
                                                key={0}
                                                className='link'
                                                onClick={closeRealAccountSignup}
                                            />,
                                        ]}
                                    />
                                )}
                            </Text>
                        </div>
                    )}
                    {!is_qualified_for_idv && !is_appstore && !is_rendered_for_onfido && (
                        <FormSubHeader title={'salutation' in values ? localize('Title and name') : localize('Name')} />
                    )}
                    {'salutation' in values && (
                        <RadioGroup
                            className='dc-radio__input'
                            name='salutation'
                            selected={values.salutation}
                            onToggle={e => {
                                e.persist();
                                setFieldValue('salutation', e.target.value);
                            }}
                            required
                        >
                            {salutation_list.map(item => (
                                <RadioGroup.Item
                                    key={item.value}
                                    label={item.label}
                                    value={item.value}
                                    disabled={!!values.salutation && disabled_items.includes('salutation')}
                                />
                            ))}
                        </RadioGroup>
                    )}
                    {'first_name' in values && (
                        <FormInputField
                            name='first_name'
                            required={is_svg || is_appstore}
                            label={is_svg || is_appstore || is_mf ? localize('First name*') : localize('First name')}
                            hint={getFieldHint(localize('first name'))}
                            disabled={disabled_items.includes('first_name') || (values?.first_name && has_real_account)}
                            placeholder={localize('John')}
                            data-testid='first_name'
                        />
                    )}
                    {'last_name' in values && (
                        <FormInputField
                            name='last_name'
                            required={is_svg || is_appstore}
                            label={getLastNameLabel()}
                            hint={getFieldHint(localize('last name'))}
                            disabled={disabled_items.includes('last_name') || (values?.last_name && has_real_account)}
                            placeholder={localize('Doe')}
                            data-testid='last_name'
                        />
                    )}
                    {!is_appstore && !is_qualified_for_idv && !is_rendered_for_onfido && (
                        <FormSubHeader title={localize('Other details')} />
                    )}
                    {'date_of_birth' in values && (
                        <DateOfBirthField
                            name='date_of_birth'
                            required={is_svg || is_appstore}
                            label={
                                is_svg || is_appstore || is_mf ? localize('Date of birth*') : localize('Date of birth')
                            }
                            hint={getFieldHint(localize('date of birth'))}
                            disabled={
                                disabled_items.includes('date_of_birth') || (values?.date_of_birth && has_real_account)
                            }
                            placeholder={localize('01-07-1999')}
                            portal_id={is_appstore ? '' : 'modal_root'}
                            data_testid='date_of_birth'
                        />
                    )}
                    {'place_of_birth' in values && (
                        <Field name='place_of_birth'>
                            {({ field }) => (
                                <React.Fragment>
                                    <DesktopWrapper>
                                        <Autocomplete
                                            {...field}
                                            disabled={
                                                disabled_items.includes('place_of_birth') ||
                                                (values?.place_of_birth && has_real_account)
                                            }
                                            data-lpignore='true'
                                            autoComplete={autocomplete_value} // prevent chrome autocomplete
                                            type='text'
                                            label={is_mf ? localize('Place of birth*') : localize('Place of birth')}
                                            error={touched.place_of_birth && errors.place_of_birth}
                                            list_items={residence_list}
                                            onItemSelection={({ value, text }) =>
                                                setFieldValue('place_of_birth', value ? text : '', true)
                                            }
                                            required
                                            data-testid='place_of_birth'
                                        />
                                    </DesktopWrapper>
                                    <MobileWrapper>
                                        <SelectNative
                                            placeholder={localize('Place of birth')}
                                            name={field.name}
                                            disabled={
                                                disabled_items.includes('place_of_birth') ||
                                                (values?.place_of_birth && has_real_account)
                                            }
                                            label={is_mf ? localize('Place of birth*') : localize('Place of birth')}
                                            list_items={residence_list}
                                            value={values.place_of_birth}
                                            use_text={true}
                                            error={touched.place_of_birth && errors.place_of_birth}
                                            onChange={e => {
                                                handleChange(e);
                                                setFieldValue('place_of_birth', e.target.value, true);
                                            }}
                                            {...field}
                                            list_portal_id='modal_root'
                                            required
                                            should_hide_disabled_options={false}
                                            data_testid='place_of_birth_mobile'
                                        />
                                    </MobileWrapper>
                                </React.Fragment>
                            )}
                        </Field>
                    )}
                    {'citizen' in values && (
                        <Field name='citizen'>
                            {({ field }) => (
                                <React.Fragment>
                                    <DesktopWrapper>
                                        <Autocomplete
                                            {...field}
                                            data-lpignore='true'
                                            autoComplete={autocomplete_value} // prevent chrome autocomplete
                                            type='text'
                                            label={is_mf ? localize('Citizenship*') : localize('Citizenship')}
                                            error={touched.citizen && errors.citizen}
                                            disabled={
                                                (values?.citizen && is_fully_authenticated) ||
                                                disabled_items.includes('citizen') ||
                                                (values?.citizen && has_real_account)
                                            }
                                            list_items={residence_list}
                                            onItemSelection={({ value, text }) =>
                                                setFieldValue('citizen', value ? text : '', true)
                                            }
                                            list_portal_id='modal_root'
                                            required
                                            data-testid='citizenship'
                                        />
                                    </DesktopWrapper>
                                    <MobileWrapper>
                                        <SelectNative
                                            placeholder={localize('Citizenship')}
                                            name={field.name}
                                            disabled={
                                                (values?.citizen && is_fully_authenticated) ||
                                                disabled_items.includes('citizen') ||
                                                (values?.citizen && has_real_account)
                                            }
                                            label={is_mf ? localize('Citizenship*') : localize('Citizenship')}
                                            list_items={residence_list}
                                            value={values.citizen}
                                            use_text={true}
                                            error={touched.citizen && errors.citizen}
                                            onChange={e => {
                                                handleChange(e);
                                                setFieldValue('citizen', e.target.value, true);
                                            }}
                                            {...field}
                                            required
                                            should_hide_disabled_options={false}
                                            data_testid='citizenship_mobile'
                                        />
                                    </MobileWrapper>
                                </React.Fragment>
                            )}
                        </Field>
                    )}
                    {'phone' in values && (
                        <FormInputField
                            name='phone'
                            label={
                                is_svg || is_appstore || is_mf ? localize('Phone number*') : localize('Phone number')
                            }
                            placeholder={
                                is_svg || is_appstore || is_mf ? localize('Phone number*') : localize('Phone number')
                            }
                            disabled={
                                disabled_items.includes('phone') ||
                                (values?.phone &&
                                    has_real_account &&
                                    validPhone(values?.phone) &&
                                    values?.phone?.length >= 9 &&
                                    values?.phone?.length <= 35)
                            }
                            maxLength={50}
                            data-testid='phone'
                        />
                    )}
                    {('tax_residence' in values || 'tax_identification_number' in values) && (
                        <React.Fragment>
                            <FormSubHeader title={localize('Tax information')} />
                            {'tax_residence' in values && (
                                <Field name='tax_residence'>
                                    {({ field }) => (
                                        <div className='details-form__tax'>
                                            <DesktopWrapper>
                                                <Autocomplete
                                                    {...field}
                                                    data-lpignore='true'
                                                    autoComplete={autocomplete_value} // prevent chrome autocomplete
                                                    type='text'
                                                    label={
                                                        is_mf ? localize('Tax residence*') : localize('Tax residence')
                                                    }
                                                    error={touched.tax_residence && errors.tax_residence}
                                                    list_items={residence_list}
                                                    onItemSelection={({ value, text }) =>
                                                        setFieldValue('tax_residence', value ? text : '', true)
                                                    }
                                                    list_portal_id='modal_root'
                                                    data-testid='tax_residence'
                                                    disabled={disabled_items.includes('tax_residence')}
                                                />
                                            </DesktopWrapper>
                                            <MobileWrapper>
                                                <SelectNative
                                                    placeholder={localize('Tax residence')}
                                                    name={field.name}
                                                    label={
                                                        is_mf ? localize('Tax residence*') : localize('Tax residence')
                                                    }
                                                    list_items={residence_list}
                                                    value={values.tax_residence}
                                                    use_text={true}
                                                    error={touched.tax_residence && errors.tax_residence}
                                                    onChange={e => {
                                                        handleChange(e);
                                                        setFieldValue('tax_residence', e.target.value, true);
                                                    }}
                                                    {...field}
                                                    required
                                                    data_testid='tax_residence_mobile'
                                                    disabled={disabled_items.includes('tax_residence')}
                                                />
                                            </MobileWrapper>
                                            <div
                                                data-testid='tax_residence_pop_over'
                                                onClick={e => {
                                                    setIsTaxResidencePopoverOpen(true);
                                                    setIsTinPopoverOpen(false);
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <Popover
                                                    alignment={isDesktop() ? 'right' : 'left'}
                                                    icon='info'
                                                    message={localize(
                                                        'The country in which you meet the criteria for paying taxes. Usually the country in which you physically reside.'
                                                    )}
                                                    zIndex={9998}
                                                    disable_message_icon
                                                    is_open={is_tax_residence_popover_open}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Field>
                            )}
                            {'tax_identification_number' in values && (
                                <div className='details-form__tax'>
                                    <FormInputField
                                        name='tax_identification_number'
                                        label={
                                            is_mf
                                                ? localize('Tax Identification Number*')
                                                : localize('Tax Identification Number')
                                        }
                                        placeholder={localize('Tax Identification Number')}
                                        warn={warning_items?.tax_identification_number}
                                        data-testid='tax_identification_number'
                                        disabled={
                                            disabled_items.includes('tax_identification_number') ||
                                            (values?.tax_identification_number && has_real_account)
                                        }
                                    />
                                    <div
                                        data-testid='tax_identification_number_pop_over'
                                        onClick={e => {
                                            setIsTaxResidencePopoverOpen(false);
                                            setIsTinPopoverOpen(true);
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Popover
                                            alignment={isDesktop() ? 'right' : 'left'}
                                            icon='info'
                                            is_open={is_tin_popover_open}
                                            message={
                                                <Localize
                                                    i18n_default_text={
                                                        "Don't know your tax identification number? Click <0>here</0> to learn more."
                                                    }
                                                    components={[
                                                        <a
                                                            key={0}
                                                            className='link link--red'
                                                            rel='noopener noreferrer'
                                                            target='_blank'
                                                            href='https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/'
                                                        />,
                                                    ]}
                                                />
                                            }
                                            zIndex={9998}
                                            disable_message_icon
                                        />
                                    </div>
                                </div>
                            )}
                            {warning_items?.tax_identification_number && (
                                <div className='details-form__tin-warn-divider' />
                            )}
                            {'employment_status' in values && (
                                <fieldset className={classNames('account-form__fieldset', 'emp-status')}>
                                    <DesktopWrapper>
                                        <Dropdown
                                            placeholder={
                                                is_mf ? localize('Employment status*') : localize('Employment status')
                                            }
                                            is_align_text_left
                                            name='employment_status'
                                            list={getEmploymentStatusList()}
                                            value={values.employment_status}
                                            onChange={handleChange}
                                            handleBlur={handleBlur}
                                            error={touched.employment_status && errors.employment_status}
                                            disabled={disabled_items.includes('employment_status')}
                                        />
                                    </DesktopWrapper>
                                    <MobileWrapper>
                                        <SelectNative
                                            placeholder={localize('Please select')}
                                            name='employment_status'
                                            label={
                                                is_mf ? localize('Employment status*') : localize('Employment status')
                                            }
                                            list_items={getEmploymentStatusList()}
                                            value={values.employment_status}
                                            error={touched.employment_status && errors.employment_status}
                                            onChange={e => {
                                                setFieldTouched('employment_status', true);
                                                handleChange(e);
                                            }}
                                            disabled={disabled_items.includes('employment_status')}
                                        />
                                    </MobileWrapper>
                                </fieldset>
                            )}
                            {'tax_identification_confirm' in values && (
                                <Checkbox
                                    name='tax_identification_confirm'
                                    className='details-form__tin-confirm'
                                    data-lpignore
                                    onChange={() =>
                                        setFieldValue(
                                            'tax_identification_confirm',
                                            !values.tax_identification_confirm,
                                            true
                                        )
                                    }
                                    value={values.tax_identification_confirm}
                                    label={localize(
                                        'I hereby confirm that the tax information I provided is true and complete. I will also inform {{legal_entity_name}} about any changes to this information.',
                                        {
                                            legal_entity_name: getLegalEntityName('maltainvest'),
                                        }
                                    )}
                                    renderlabel={title => (
                                        <Text size='xs' line_height='s'>
                                            {title}
                                        </Text>
                                    )}
                                    withTabIndex={0}
                                    data-testid='tax_identification_confirm'
                                />
                            )}
                        </React.Fragment>
                    )}
                    {'account_opening_reason' in values && (
                        <React.Fragment>
                            <FormSubHeader title={localize('Account opening reason')} />
                            <Field name='account_opening_reason'>
                                {({ field }) => (
                                    <React.Fragment>
                                        <DesktopWrapper>
                                            <Dropdown
                                                placeholder={
                                                    is_mf
                                                        ? localize('Account opening reason*')
                                                        : localize('Account opening reason')
                                                }
                                                name={field.name}
                                                disabled={disabled_items.includes('account_opening_reason')}
                                                is_align_text_left
                                                list={account_opening_reason_list}
                                                value={values.account_opening_reason}
                                                onChange={handleChange}
                                                handleBlur={handleBlur}
                                                error={touched.account_opening_reason && errors.account_opening_reason}
                                                {...field}
                                                list_portal_id='modal_root'
                                                required
                                            />
                                        </DesktopWrapper>
                                        <MobileWrapper>
                                            <SelectNative
                                                placeholder={localize('Please select')}
                                                name={field.name}
                                                label={
                                                    is_mf
                                                        ? localize('Account opening reason*')
                                                        : localize('Account opening reason')
                                                }
                                                list_items={account_opening_reason_list}
                                                value={values.account_opening_reason}
                                                error={touched.account_opening_reason && errors.account_opening_reason}
                                                onChange={e => {
                                                    handleChange(e);
                                                    setFieldValue('account_opening_reason', e.target.value, true);
                                                }}
                                                {...field}
                                                required
                                                data_testid='account_opening_reason_mobile'
                                                disabled={disabled_items.includes('account_opening_reason')}
                                            />
                                        </MobileWrapper>
                                    </React.Fragment>
                                )}
                            </Field>
                        </React.Fragment>
                    )}
                </fieldset>
            </FormBodySection>
        </div>
    );
};

export default PersonalDetailsForm;
