import React from 'react';
import { useKycAuthStatus } from '@deriv/api-v2';
import { Loader } from '@deriv-com/ui';
import { POI_SERVICE } from '../../constants/constants';
import { usePOIInfo } from '../../hooks';
import { IDVService, ManualUpload, OnfidoContainer } from '../../modules/src';

type TPOIFlowContainerProps = {
    countryCode: string;
};

type TSupportedDocuments = DeepNonNullable<
    ReturnType<typeof useKycAuthStatus>['kyc_auth_status']
>['identity']['supported_documents']['idv'];

export const POIFlowContainer = ({ countryCode }: TPOIFlowContainerProps) => {
    const { isLoading, kycAuthStatus } = usePOIInfo({ country: countryCode });

    if (isLoading || !kycAuthStatus) {
        return <Loader />;
    }

    const {
        identity: { available_services: availableServices, supported_documents: supportedDocuments },
    } = kycAuthStatus;

    switch (availableServices?.[0]) {
        case POI_SERVICE.onfido: {
            return <OnfidoContainer countryCode={countryCode} />;
        }
        case POI_SERVICE.idv: {
            return (
                <IDVService
                    countryCode={countryCode}
                    supportedDocuments={supportedDocuments?.idv as TSupportedDocuments}
                />
            );
        }
        default: {
            return <ManualUpload countryCode={countryCode} />;
        }
    }
};
