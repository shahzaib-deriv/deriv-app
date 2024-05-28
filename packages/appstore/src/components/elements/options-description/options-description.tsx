import React from 'react';
import { Text, StaticUrl } from '@deriv/components';
import { Localize } from '@deriv/translations';

type TOptionsDescription = {
    is_eu_user: boolean;
};

const OptionsDescription = ({ is_eu_user }: TOptionsDescription) => {
    return is_eu_user ? (
        <Text size='xs'>
            <Localize
                i18n_default_text='Multipliers let you trade with leverage and limit your risk to your stake. <0>Learn more</0>'
                components={[<StaticUrl key={0} className='options' href='trade-types/multiplier/' />]}
            />
        </Text>
    ) : (
        <div>
            <Text size='xs'>
                <Localize
                    i18n_default_text='Earn potential profits when the market aligns with your prediction, with risks capped at your initial stake. <0>Learn more</0>'
                    components={[
                        <StaticUrl
                            key={0}
                            className='options'
                            href='trade-types/options/digital-options/up-and-down/'
                        />,
                    ]}
                />
            </Text>
        </div>
    );
};

export default OptionsDescription;
