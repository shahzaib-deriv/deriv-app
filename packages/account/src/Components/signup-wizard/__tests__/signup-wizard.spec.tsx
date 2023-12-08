import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupWizard from '../signup-wizard';
import { useSignupWizardContext } from '../context';

jest.mock('../context', () => ({
    useSignupWizardContext: jest.fn(),
}));

const mockedUseSignupWizardContext = useSignupWizardContext as jest.MockedFunction<typeof useSignupWizardContext>;

describe('SignupWizard', () => {
    let modal_root_el: HTMLDivElement;
    const closeWizard = jest.fn();

    beforeAll(() => {
        modal_root_el = document.createElement('div');
        modal_root_el.setAttribute('id', 'modal_root');
        document.body.appendChild(modal_root_el);

        mockedUseSignupWizardContext.mockReturnValue({
            is_wizard_open: true,
            closeWizard,
            currentStep: 1,
            helpers: {
                goToNextStep: jest.fn(),
                goToPrevStep: jest.fn(),
                reset: jest.fn(),
                canGoToNextStep: true,
                canGoToPrevStep: true,
                setStep: jest.fn(),
            },
        });
    });

    afterAll(() => {
        document.body.removeChild(modal_root_el);
    });

    it('should render SignupWizard correctly', () => {
        render(<SignupWizard />);

        expect(screen.getByTestId('dt-signup-wizard-timeline-container')).toBeInTheDocument();
        expect(screen.getByTestId('dt-signup-wizard-content-container')).toBeInTheDocument();
    });

    it('should close the wizard on clicking close icon', () => {
        render(<SignupWizard />);

        const closeIcon = screen.getByTestId('dt-close-icon');
        userEvent.click(closeIcon);
        expect(closeWizard).toHaveBeenCalled();
    });
});
