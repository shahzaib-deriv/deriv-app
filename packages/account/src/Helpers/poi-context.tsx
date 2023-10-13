import { ResidenceList } from '@deriv/api-types';
import { service_code, submission_status_code } from 'Sections/Verification/ProofOfIdentity/proof-of-identity-utils';
import React from 'react';

type TSubmissionStatus = keyof typeof submission_status_code;
type TSubmissionService = keyof typeof service_code;

type TPOIContext = {
    submission_status: TSubmissionStatus;
    setSubmissionStatus: React.Dispatch<React.SetStateAction<TSubmissionStatus>>;
    submission_service: TSubmissionService;
    setSubmissionService: React.Dispatch<React.SetStateAction<TSubmissionService>>;
    selected_country: ResidenceList[number];
    setSelectedCountry: React.Dispatch<React.SetStateAction<ResidenceList[number]>>;
};

export const POIContextInitialState: TPOIContext = {
    submission_status: submission_status_code.selecting,
    setSubmissionStatus: () => submission_status_code.selecting,
    submission_service: service_code.idv,
    setSubmissionService: () => service_code.idv,
    selected_country: {},
    setSelectedCountry: () => ({}),
};

export const POIContext = React.createContext<TPOIContext>(POIContextInitialState);

export const POIProvider = ({ children }: React.PropsWithChildren) => {
    const [submission_status, setSubmissionStatus] = React.useState<TSubmissionStatus>(
        submission_status_code.selecting
    );
    const [submission_service, setSubmissionService] = React.useState<TSubmissionService>(service_code.idv);
    const [selected_country, setSelectedCountry] = React.useState({});

    const state = {
        submission_status,
        setSubmissionStatus,
        submission_service,
        setSubmissionService,
        selected_country,
        setSelectedCountry,
    };

    return <POIContext.Provider value={state}>{children}</POIContext.Provider>;
};
