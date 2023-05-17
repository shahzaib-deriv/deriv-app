const path = require('path');
const { ALIASES, IS_RELEASE, MINIMIZERS, plugins, rules } = require('./constants');

module.exports = function (env) {
    const base = env && env.base && env.base !== true ? `/${env.base}/` : '/';

    return {
        context: path.resolve(__dirname, '../src'),
        devtool: IS_RELEASE ? undefined : 'eval-cheap-module-source-map',
        entry: {
            account: path.resolve(__dirname, '../src', 'index.tsx'),
            'accept-risk-config': 'Configs/accept-risk-config',
            'account-limits': 'Components/account-limits',
            'address-details': 'Components/address-details',
            'address-details-config': 'Configs/address-details-config',
            'api-token': 'Components/api-token',
            'currency-selector': 'Components/currency-selector',
            'currency-selector-config': 'Configs/currency-selector-config',
            'currency-selector-schema': 'Configs/currency-selector-schema',
            'currency-radio-button-group': 'Components/currency-selector/radio-button-group.tsx',
            'currency-radio-button': 'Components/currency-selector/radio-button.tsx',
            'demo-message': 'Components/demo-message',
            'error-component': 'Components/error-component',
            'file-uploader-container': 'Components/file-uploader-container',
            'financial-assessment': 'Sections/Assessment/FinancialAssessment',
            'financial-details': 'Components/financial-details',
            'financial-details-config': 'Configs/financial-details-config',
            'form-body': 'Components/form-body',
            'form-footer': 'Components/form-footer',
            'form-sub-header': 'Components/form-sub-header',
            'get-status-badge-config': 'Configs/get-status-badge-config',
            'icon-message-content': 'Components/icon-message-content',
            'leave-confirm': 'Components/leave-confirm',
            'load-error-message': 'Components/load-error-message',
            'personal-details': 'Components/personal-details',
            'personal-details-config': 'Configs/personal-details-config',
            'poa-expired': 'Components/poa/status/expired',
            'poa-needs-review': 'Components/poa/status/needs-review',
            'poa-status-codes': 'Components/poa/status/status-codes',
            'poa-submitted': 'Components/poa/status/submitted',
            'poa-unverified': 'Components/poa/status/unverified',
            'poa-verified': 'Components/poa/status/verified',
            'poi-expired': 'Components/poi/status/expired',
            'poi-missing-personal-details': 'Components/poi/missing-personal-details',
            'poi-unsupported': 'Components/poi/status/unsupported',
            'poi-upload-complete': 'Components/poi/status/upload-complete',
            'poi-verified': 'Components/poi/status/verified',
            'proof-of-address-container': 'Sections/Verification/ProofOfAddress/proof-of-address-container.jsx',
            'proof-of-identity': 'Sections/Verification/ProofOfIdentity/proof-of-identity.jsx',
            'proof-of-identity-container': 'Sections/Verification/ProofOfIdentity/proof-of-identity-container.jsx',
            'proof-of-identity-config': 'Configs/proof-of-identity-config',
            'proof-of-identity-container-for-mt5':
                'Sections/Verification/ProofOfIdentity/proof-of-identity-container-for-mt5',
            'poi-poa-docs-submitted': 'Components/poi-poa-docs-submitted/poi-poa-docs-submitted',
            'reset-trading-password-modal': 'Components/reset-trading-password-modal',
            'risk-tolerance-warning-modal': 'Components/trading-assessment/risk-tolerance-warning-modal.jsx',
            'self-exclusion': 'Components/self-exclusion',
            'scrollbars-container': 'Components/scrollbars-container',
            'sent-email-modal': 'Components/sent-email-modal',
            'terms-of-use': 'Components/terms-of-use',
            'terms-of-use-config': 'Configs/terms-of-use-config',
            'trading-assessment': 'Sections/Assessment/TradingAssessment',
            'trading-assessment-config': 'Configs/trading-assessment-config',
            'trading-assessment-new-user': 'Components/trading-assessment/trading-assessment-new-user.jsx',
            'test-warning-modal': 'Components/trading-assessment/test-warning-modal.jsx',
            'trading-assessment-form': 'Components/trading-assessment/trading-assessment-form.jsx',
        },
        mode: IS_RELEASE ? 'production' : 'development',
        module: {
            rules: rules(),
        },
        resolve: {
            alias: ALIASES,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        optimization: {
            chunkIds: 'named',
            moduleIds: 'named',
            minimize: IS_RELEASE,
            minimizer: MINIMIZERS,
        },
        output: {
            filename: 'account/js/[name].js',
            publicPath: base,
            path: path.resolve(__dirname, '../dist'),
            chunkFilename: 'account/js/account.[name].[contenthash].js',
            libraryExport: 'default',
            library: '@deriv/account',
            libraryTarget: 'umd',
        },
        externals: [
            {
                react: 'react',
                'react-dom': 'react-dom',
                'react-router-dom': 'react-router-dom',
                'react-router': 'react-router',
                mobx: 'mobx',
                'mobx-react': 'mobx-react',
                '@deriv/shared': '@deriv/shared',
                '@deriv/components': '@deriv/components',
                '@deriv/translations': '@deriv/translations',
            },
            /^@deriv\/shared\/.+$/,
            /^@deriv\/components\/.+$/,
            /^@deriv\/translations\/.+$/,
        ],
        target: 'web',
        plugins: plugins(base, false),
    };
};
