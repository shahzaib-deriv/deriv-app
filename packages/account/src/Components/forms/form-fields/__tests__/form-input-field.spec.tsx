import React from 'react';
import { render, screen } from '@testing-library/react';
import FormInputField from '../form-input-field';
import { Formik } from 'formik';

describe('Tesing <FormInputField/> component', () => {
    it('should render properties', () => {
        const props = {
            name: 'test-name',
            optional: true,
        };
        render(
            <Formik initialValues={{}} onSubmit={jest.fn()}>
                <FormInputField {...props} />
            </Formik>
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render Input field with optional status', () => {
        const props = {
            name: 'test-name',
            optional: true,
        };
        render(
            <Formik initialValues={{}} onSubmit={jest.fn()}>
                <FormInputField {...props} />
            </Formik>
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).not.toBeRequired();
    });
});
