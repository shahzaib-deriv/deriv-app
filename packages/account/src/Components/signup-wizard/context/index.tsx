import { observer, useStore } from '@deriv/stores';
import React from 'react';
import { useStep } from 'usehooks-ts';

type Helpers = ReturnType<typeof useStep>[1];

type TSignupWizardContext = {
    is_wizard_open: boolean;
    closeWizard: () => void;
    currentStep: number;
    helpers: Helpers;
};

type TSignupWizardProvider = {
    children: React.ReactNode;
};

const initialHelpers: Helpers = {
    goToNextStep: () => {
        /* noop */
    },
    goToPrevStep: () => {
        /* noop */
    },
    reset: () => {
        /* noop */
    },
    canGoToNextStep: false,
    canGoToPrevStep: false,
    setStep: (() => {
        /* noop */
    }) as React.Dispatch<React.SetStateAction<number>>,
};
const SignupWizardContext = React.createContext<TSignupWizardContext>({
    is_wizard_open: false,
    closeWizard: () => {
        /* noop */
    },
    currentStep: 0,
    helpers: initialHelpers,
});

export const useSignupWizardContext = () => React.useContext(SignupWizardContext);

const SignupWizardProvider = observer(({ children }: TSignupWizardProvider) => {
    const {
        ui: { is_real_acc_signup_on, closeRealAccountSignup },
    } = useStore();
    const [currentStep, helpers] = useStep(5);

    const context_state = React.useMemo(
        () => ({
            is_wizard_open: is_real_acc_signup_on,
            closeWizard: closeRealAccountSignup,
            currentStep,
            helpers,
        }),
        [closeRealAccountSignup, currentStep, helpers, is_real_acc_signup_on]
    );

    return <SignupWizardContext.Provider value={context_state}>{children}</SignupWizardContext.Provider>;
});

export default SignupWizardProvider;
