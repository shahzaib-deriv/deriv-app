import React from 'react';
import RealAccountSignupFlow from './real-account-signup-flow.jsx';
import { observer, useStore } from '@deriv/stores';
import SignupWizard from '@deriv/account/src/Components/signup-wizard';
import SignupWizardProvider from '@deriv/account/src/Components/signup-wizard/context';

const RealAccountSignup = observer(props => {
    const { feature_flags } = useStore();
    const {
        data: { next_signup_flow },
    } = feature_flags;

    if (next_signup_flow) {
        return (
            <SignupWizardProvider>
                <SignupWizard />
            </SignupWizardProvider>
        );
    }

    return <RealAccountSignupFlow {...props} />;
});

export default RealAccountSignup;
