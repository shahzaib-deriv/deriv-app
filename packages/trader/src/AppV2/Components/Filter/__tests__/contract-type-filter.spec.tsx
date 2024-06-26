import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractTypeFilter from '../contract-type-filter';

const defaultFilterName = 'All trade types';
const mockProps = {
    setContractTypeFilter: jest.fn(),
    contractTypeFilter: [],
};
const mediaQueryList = {
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
};

window.matchMedia = jest.fn().mockImplementation(() => mediaQueryList);

describe('ContractTypeFilter', () => {
    it('should change data-state of the dropdown if user clicks on the filter', () => {
        render(<ContractTypeFilter {...mockProps} />);

        const dropdownChevron = screen.getByTestId('dt_chevron');
        expect(dropdownChevron).toHaveClass('rotate--close');

        userEvent.click(screen.getByText(defaultFilterName));
        expect(dropdownChevron).toHaveClass('rotate--open');
    });

    it('should render correct chip name if contractTypeFilter is with single item', () => {
        const mockContractTypeFilter = ['Multipliers'];

        render(<ContractTypeFilter {...mockProps} contractTypeFilter={mockContractTypeFilter} />);

        expect(screen.queryByText(defaultFilterName)).not.toBeInTheDocument();
        expect(screen.getAllByText(mockContractTypeFilter[0])).toHaveLength(2);
    });

    it('should render correct chip name is contractTypeFilter is with multiple items', () => {
        const mockContractTypeFilter = ['Vanillas', 'Turbos'];
        render(<ContractTypeFilter {...mockProps} contractTypeFilter={mockContractTypeFilter} />);

        expect(screen.queryByText(defaultFilterName)).not.toBeInTheDocument();
        expect(screen.getByText(`${mockContractTypeFilter.length} trade types`)).toBeInTheDocument();
    });

    it('should call setContractTypeFilter and setter (spied on) with array with chosen option after user clicks on contract type and clicks on "Apply" button', async () => {
        const mockSetChangedOptions = jest.fn();
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [[], mockSetChangedOptions]);

        render(<ContractTypeFilter {...mockProps} />);

        userEvent.click(screen.getByText('Accumulators'));
        userEvent.click(screen.getByText('Apply'));

        expect(mockSetChangedOptions).toHaveBeenCalledWith(['Accumulators']);
        expect(mockProps.setContractTypeFilter).toBeCalled();
    });

    it('should call setter (spied on) with array without chosen option if user clicks on it, but it was already in contractTypeFilter', async () => {
        const mockContractTypeFilter = ['Rise/Fall', 'Higher/Lower'];
        const mockSetChangedOptions = jest.fn();
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [mockContractTypeFilter, mockSetChangedOptions]);

        render(<ContractTypeFilter {...mockProps} contractTypeFilter={mockContractTypeFilter} />);

        userEvent.click(screen.getByText('Rise/Fall'));

        expect(mockSetChangedOptions).toHaveBeenCalledWith(['Higher/Lower']);
    });

    it('should call setter (spied on) with empty array if user clicks on "Clear All" button', async () => {
        const mockContractTypeFilter = ['Touch/No Touch'];
        const mockSetChangedOptions = jest.fn();
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [false, jest.fn()])
            .mockImplementationOnce(() => [mockContractTypeFilter, mockSetChangedOptions]);

        render(<ContractTypeFilter {...mockProps} contractTypeFilter={mockContractTypeFilter} />);

        userEvent.click(screen.getByText('Clear All'));

        expect(mockSetChangedOptions).toHaveBeenCalledWith([]);
    });
});
