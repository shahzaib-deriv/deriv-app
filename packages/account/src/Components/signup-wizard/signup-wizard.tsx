import React from 'react';
import { Button, Icon, Modal } from '@deriv/components';
import classes from './signup-wizard.module.scss';
import { useSignupWizardContext } from './context';

const SignupWizard = () => {
    const { is_wizard_open, closeWizard, helpers } = useSignupWizardContext();
    return (
        <Modal is_open={is_wizard_open}>
            <Modal.Body className={classes.signup_wizard}>
                <div data-testid='dt-signup-wizard-timeline-container' className={classes.timeline_container}>
                    Add real Deriv Account
                </div>
                <div data-testid='dt-signup-wizard-content-container' className={classes.content_container}>
                    <div className={classes.close_icon}>
                        <Icon data_testid='dt-close-icon' onClick={closeWizard} icon='IcCloseDark' />
                    </div>
                    <div className={classes.section}>Select your preferred currency</div>
                    <Modal.Footer>
                        <Button primary disabled={!helpers.canGoToNextStep} onClick={helpers.goToNextStep}>
                            Next
                        </Button>
                    </Modal.Footer>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SignupWizard;
