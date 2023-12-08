import React from 'react';
import { Button, Icon, Modal } from '@deriv/components';
import classes from './signup-wizard.module.scss';
import { useSignupWizardContext } from './context';

const SignupWizard = () => {
    const { is_wizard_open, closeWizard } = useSignupWizardContext();
    return (
        <Modal is_open={is_wizard_open}>
            <Modal.Body className={classes.signup_wizard}>
                <div className={classes.timeline_container}>Add real Deriv Account</div>
                <div className={classes.content_container}>
                    <div className={classes.close_icon}>
                        <Icon onClick={closeWizard} icon='IcCloseDark' />
                    </div>
                    <div className={classes.section}>Select your preferred currency</div>
                    <Modal.Footer>
                        <Button onClick={closeWizard}>Next</Button>
                    </Modal.Footer>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default SignupWizard;
