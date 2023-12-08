import React from 'react';
import { observer, useStore } from '@deriv/stores';
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
    is_wizard_open: boolean;
    closeWizard: () => void;
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
    currentStep: 1,
    helpers: initialHelpers,
});

export const useSignupWizardContext = () => React.useContext(SignupWizardContext);

const SignupWizardProvider = ({ children, is_wizard_open, closeWizard }: TSignupWizardProvider) => {
    const [currentStep, helpers] = useStep(5);

    const context_state = React.useMemo(
        () => ({
            is_wizard_open,
            closeWizard,
            currentStep,
            helpers,
        }),
        [closeWizard, currentStep, helpers, is_wizard_open]
    );

    return <SignupWizardContext.Provider value={context_state}>{children}</SignupWizardContext.Provider>;
};

export default SignupWizardProvider;
