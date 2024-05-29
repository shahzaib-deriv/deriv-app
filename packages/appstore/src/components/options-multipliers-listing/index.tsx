import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Text, StaticUrl } from '@deriv/components';
import { setPerformanceValue } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { Localize, localize } from '@deriv/translations';
import ListingContainer from 'Components/containers/listing-container';
import TradingAppCard from 'Components/containers/trading-app-card';
import { BrandConfig } from 'Constants/platform-config';
import { getHasDivider } from 'Constants/utils';
import { Analytics } from '@deriv-com/analytics';
import { getAvailablePlatforms } from '../../helpers';

const OptionsAndMultipliersListing = observer(() => {
    const { traders_hub, client, ui } = useStore();
    const { available_platforms, is_eu_user, is_real, no_MF_account, no_CR_account, is_demo, selected_account_type } =
        traders_hub;
    const { has_maltainvest_account, real_account_creation_unlock_date, is_landing_company_loaded } = client;

    const { setShouldShowCooldownModal, openRealAccountSignup, is_mobile } = ui;

    const platforms = getAvailablePlatforms();

    const OptionsTitle = () => {
        if (is_mobile) return null;
        if (platforms.includes('options')) {
            return (
                <Text size='sm' weight='bold'>
                    <Localize i18n_default_text='Options' />
                </Text>
            );
        } else if (!platforms.includes('options')) {
            return (
                <Text size='sm' weight='bold' color='prominent'>
                    <Localize i18n_default_text='Multipliers' />
                </Text>
            );
        }
        return null;
    };

    useEffect(() => {
        if (is_landing_company_loaded) {
            setPerformanceValue('option_multiplier_section_loading_time');
        }
    }, [is_landing_company_loaded]);

    return (
        <ListingContainer
            title={<OptionsTitle />}
            description={
                platforms.includes('options') && platforms.includes('multipliers') ? (
                    <Text size='xs' line_height='s'>
                        <Localize
                            i18n_default_text='Buy or sell at a specific time for a specific price. <0>Learn more</0>'
                            components={[
                                <StaticUrl
                                    key={0}
                                    className='options'
                                    href='trade-types/options/digital-options/up-and-down/'
                                />,
                            ]}
                        />
                    </Text>
                ) : (
                    <Text size='xs' line_height='s'>
                        <Localize
                            i18n_default_text='Multipliers let you trade with leverage and limit your risk to your stake. <0>Learn more</0>'
                            components={[<StaticUrl key={0} className='options' href='trade-types/multiplier/' />]}
                        />
                    </Text>
                )
            }
            is_deriv_platform
        >
            {is_real && (no_CR_account || no_MF_account) && (
                <div className='full-row'>
                    <TradingAppCard
                        action_type='get'
                        availability='All'
                        clickable_icon
                        name={localize('Deriv account')}
                        description={
                            is_eu_user
                                ? localize('To trade multipliers, get a Deriv Apps account first.')
                                : localize('To trade options and multipliers, get a Deriv Apps account first.')
                        }
                        icon='Options'
                        onAction={() => {
                            if (no_MF_account) {
                                if (real_account_creation_unlock_date) {
                                    setShouldShowCooldownModal(true);
                                } else {
                                    openRealAccountSignup('maltainvest');
                                }
                            } else {
                                openRealAccountSignup('svg');
                            }
                        }}
                    />
                </div>
            )}

            {available_platforms.map((available_platform: BrandConfig, index: number) => (
                <TradingAppCard
                    key={`trading_app_card_${available_platform.name}`}
                    {...available_platform}
                    clickable_icon
                    action_type={
                        is_demo || (!no_CR_account && !is_eu_user) || (has_maltainvest_account && is_eu_user)
                            ? 'trade'
                            : 'none'
                    }
                    is_deriv_platform
                    onAction={() => {
                        Analytics.trackEvent('ce_tradershub_dashboard_form', {
                            action: 'account_open',
                            form_name: 'traders_hub_default',
                            account_mode: selected_account_type,
                            account_name: is_demo ? `${available_platform.name} Demo` : available_platform.name,
                        });
                    }}
                    has_divider={(!is_eu_user || is_demo) && getHasDivider(index, available_platforms.length, 3)}
                />
            ))}
        </ListingContainer>
    );
});

export default OptionsAndMultipliersListing;
