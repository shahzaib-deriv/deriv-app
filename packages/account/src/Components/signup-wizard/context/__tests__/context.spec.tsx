import React from 'react';
import { render, screen } from '@testing-library/react';
import SignupWizardProvider, { useSignupWizardContext } from '..';
import userEvent from '@testing-library/user-event';

describe('SignupWizardProvider', () => {
    it('should render children and provide wizard context', () => {
        const mockCloseWizard = jest.fn();
        const is_wizard_open = true;

        const TestComponent = () => {
            const context = useSignupWizardContext();
            return (
                <>
                    <div data-testid='is_wizard_open'>{context.is_wizard_open.toString()}</div>
                    <button data-testid='close_wizard' onClick={context.closeWizard}>
                        Close
                    </button>
                    <div data-testid='current_step'>{context.currentStep}</div>
                </>
            );
        };

        render(
            <SignupWizardProvider is_wizard_open={is_wizard_open} closeWizard={mockCloseWizard}>
                <TestComponent />
            </SignupWizardProvider>
        );

        expect(screen.getByTestId('is_wizard_open')).toHaveTextContent('true');
        expect(screen.getByTestId('current_step')).toHaveTextContent('1');

        const closeWizardButton = screen.getByTestId('close_wizard');
        expect(closeWizardButton).toBeInTheDocument();
        closeWizardButton.click();
        expect(mockCloseWizard).toHaveBeenCalled();
    });

    it('should update current step when changed', () => {
        const TestComponent = () => {
            const { currentStep, helpers } = useSignupWizardContext();
            return (
                <>
                    <div data-testid='current_step'>{currentStep}</div>
                    <button data-testid='go_to_next_step' onClick={helpers.goToNextStep}>
                        Next
                    </button>
                </>
            );
        };

        render(
            <SignupWizardProvider is_wizard_open closeWizard={jest.fn()}>
                <TestComponent />
            </SignupWizardProvider>
        );
        expect(screen.getByTestId('current_step')).toHaveTextContent('1');

        const nextStepButton = screen.getByTestId('go_to_next_step');
        userEvent.click(nextStepButton);
        expect(screen.getByTestId('current_step')).toHaveTextContent('2');
    });
});
