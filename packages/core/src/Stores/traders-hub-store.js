import { action, computed, makeObservable, observable, reaction } from 'mobx';

import {
    CFD_PLATFORMS,
    ContentFlag,
    LocalStore,
    formatMoney,
    getAppstorePlatforms,
    getCFDAvailableAccount,
} from '@deriv/shared';
import { localize } from '@deriv/translations';
import BaseStore from './base-store';
import { isEuCountry } from '_common/utility';

export default class TradersHubStore extends BaseStore {
    available_platforms = [];
    available_cfd_accounts = [];
    available_mt5_accounts = [];
    available_dxtrade_accounts = [];
    available_ctrader_accounts = [];
    combined_cfd_mt5_accounts = [];
    selected_account_type;
    selected_region;
    is_onboarding_visited = false;
    is_first_time_visit = true;
    is_failed_verification_modal_visible = false;
    is_regulators_compare_modal_visible = false;
    is_mt5_notification_modal_visible = false;
    account_type_card = '';
    selected_platform_type = 'options';
    mt5_existing_account = {};
    open_failed_verification_for = '';
    modal_data = {
        active_modal: '',
        data: {},
    };
    is_account_transfer_modal_open = false;
    selected_account = {};
    is_real_wallets_upgrade_on = false;
    is_wallet_migration_failed = false;
    active_modal_tab;
    active_modal_wallet_id;

    constructor(root_store) {
        super({ root_store });

        makeObservable(this, {
            account_type_card: observable,
            available_cfd_accounts: observable,
            available_dxtrade_accounts: observable,
            available_ctrader_accounts: observable,
            available_mt5_accounts: observable,
            available_platforms: observable,
            combined_cfd_mt5_accounts: observable,
            is_account_transfer_modal_open: observable,
            is_regulators_compare_modal_visible: observable,
            is_mt5_notification_modal_visible: observable,
            is_failed_verification_modal_visible: observable,
            modal_data: observable,
            is_onboarding_visited: observable,
            is_first_time_visit: observable,
            selected_account: observable,
            selected_account_type: observable,
            selected_platform_type: observable,
            active_modal_tab: observable,
            active_modal_wallet_id: observable,
            selected_region: observable,
            mt5_existing_account: observable,
            open_failed_verification_for: observable,
            is_real_wallets_upgrade_on: observable,
            is_wallet_migration_failed: observable,
            closeModal: action.bound,
            content_flag: computed,
            getAccount: action.bound,
            getAvailableCFDAccounts: action.bound,
            getAvailableDxtradeAccounts: action.bound,
            getAvailableCTraderAccounts: action.bound,
            getExistingAccounts: action.bound,
            handleTabItemClick: action.bound,
            setWalletModalActiveTab: action.bound,
            setWalletModalActiveWalletID: action.bound,
            has_any_real_account: computed,
            is_demo_low_risk: computed,
            is_demo: computed,
            is_eu_selected: computed,
            is_real: computed,
            is_low_risk_cr_eu_real: computed,
            no_CR_account: computed,
            no_MF_account: computed,
            CFDs_restricted_countries: computed,
            financial_restricted_countries: computed,
            openDemoCFDAccount: action.bound,
            openModal: action.bound,
            openRealAccount: action.bound,
            selectAccountType: action.bound,
            selectAccountTypeCard: action.bound,
            switchToCRAccount: action.bound,
            selectRegion: action.bound,
            setCombinedCFDMT5Accounts: action.bound,
            setSelectedAccount: action.bound,
            setTogglePlatformType: action.bound,
            should_show_exit_traders_modal: computed,
            show_eu_related_content: computed,
            startTrade: action.bound,
            toggleAccountTransferModal: action.bound,
            closeAccountTransferModal: action.bound,
            setIsOnboardingVisited: action.bound,
            setIsFirstTimeVisit: action.bound,
            setMT5NotificationModal: action.bound,
            toggleFailedVerificationModalVisibility: action.bound,
            setMT5ExistingAccount: action.bound,
            openFailedVerificationModal: action.bound,
            toggleRegulatorsCompareModal: action.bound,
            showTopUpModal: action.bound,
            toggleWalletsUpgrade: action.bound,
            setWalletsMigrationFailedPopup: action.bound,
        });

        reaction(
            () => [
                this.selected_account_type,
                this.selected_region,
                this.root_store.client.is_switching,
                this.root_store.client.mt5_login_list,
                this.root_store.client.dxtrade_accounts_list,
                this.root_store.client.ctrader_accounts_list,
                this.is_demo_low_risk,
                this.root_store.modules?.cfd?.current_list,
                this.root_store.client.landing_companies,
                this.root_store.common.current_language,
                this.financial_restricted_countries,
            ],
            () => {
                this.getAvailablePlatforms();
                this.getAvailableCFDAccounts();

                // Set the platforms for the trading app cards based on the content flag and the client's residence status (EU/Non-EU)
                const low_risk_cr_non_eu = this.content_flag === ContentFlag.LOW_RISK_CR_NON_EU;
                const high_risk_cr = this.content_flag === ContentFlag.HIGH_RISK_CR;
                const cr_demo = this.content_flag === ContentFlag.CR_DEMO;
                const platforms = this.root_store.client.is_mt5_allowed ? ['multipliers', 'cfds'] : ['multipliers'];

                if (
                    this.root_store.client.is_landing_company_loaded &&
                    (low_risk_cr_non_eu || high_risk_cr || cr_demo || this.selected_region === 'Non-EU')
                ) {
                    platforms.push('options');
                }
                this.root_store.client.is_landing_company_loaded &&
                    localStorage.setItem('th_platforms', JSON.stringify(platforms));

                if (this.selected_region !== 'EU' && localStorage.getItem('is_eu_user')) {
                    localStorage.removeItem('is_eu_user');
                }
            }
        );

        reaction(
            () => [
                this.selected_region,
                this.root_store.client.is_landing_company_loaded,
                this.root_store.client.loginid,
            ],
            () => {
                if (this.selected_account_type === 'real') {
                    this.setSwitchEU();
                }
            }
        );

        reaction(
            () => [this.root_store.client.loginid, this.root_store.client.residence],
            () => {
                const loginid = localStorage.getItem('active_loginid');
                const is_eu_user = localStorage.getItem('is_eu_user') === 'true';

                const active_demo = /^VRT|VRW/.test(loginid);
                const active_real_mf = /^MF|MFW/.test(loginid);
                const active_real_cr = /^CR/.test(loginid);

                const default_region = () => {
                    if (active_real_cr) {
                        return 'Non-EU';
                    }

                    if (active_real_mf || is_eu_user) {
                        // store the user's region in localStorage to remember the user's region selection on page refresh
                        localStorage.setItem('is_eu_user', true);
                        return 'EU';
                    }

                    if (active_demo) {
                        return 'Non-EU';
                    }

                    return 'Non-EU';
                };
                this.selected_account_type = !active_demo ? 'real' : 'demo';
                this.selected_region = default_region();
            }
        );
    }

    async setSwitchEU() {
        const { account_list, switchAccount, loginid, setIsLoggingIn } = this.root_store.client;

        const mf_account = account_list.find(acc => acc.loginid?.startsWith('MF'))?.loginid;
        const cr_account = account_list.find(acc => acc.loginid?.startsWith('CR'))?.loginid;

        if (this.selected_region === 'EU' && !loginid?.startsWith('MF')) {
            // if active_loginid is already EU = do nothing
            await switchAccount(mf_account).then(() => {
                setIsLoggingIn(false);
            });
        } else if (this.selected_region === 'Non-EU' && !loginid?.startsWith('CR')) {
            await switchAccount(cr_account).then(() => {
                setIsLoggingIn(false);
            });
        }
    }

    setWalletModalActiveTab(tab) {
        this.active_modal_tab = tab;
    }

    setWalletModalActiveWalletID(wallet_id) {
        this.active_modal_wallet_id = wallet_id;
    }

    get no_MF_account() {
        const { has_maltainvest_account } = this.root_store.client;
        return this.selected_region === 'EU' && !has_maltainvest_account;
    }

    get no_CR_account() {
        const { active_accounts } = this.root_store.client;
        const result = active_accounts.some(acc => acc.landing_company_shortcode === 'svg');
        return !result && this.selected_region === 'Non-EU';
    }

    setSelectedAccount(account) {
        this.selected_account = account;
    }

    async selectAccountType(account_type) {
        const { account_list, switchAccount, prev_real_account_loginid, has_active_real_account } =
            this.root_store.client;

        if (account_type === 'demo') {
            const is_low_risk_cr_real_account =
                this.content_flag === ContentFlag.LOW_RISK_CR_NON_EU ||
                this.content_flag === ContentFlag.LOW_RISK_CR_EU;
            if (is_low_risk_cr_real_account) {
                localStorage.removeItem('is_eu_user');
            }
            await switchAccount(account_list.find(acc => acc.is_virtual && !acc.is_disabled)?.loginid);
        } else if (account_type === 'real') {
            if (!has_active_real_account && this.content_flag === ContentFlag.EU_DEMO) {
                if (this.root_store.client.real_account_creation_unlock_date) {
                    this.root_store.ui.setShouldShowCooldownModal(true);
                } else {
                    this.root_store.ui.openRealAccountSignup('maltainvest');
                }
            } else if (!has_active_real_account) {
                this.root_store.ui.openRealAccountSignup('svg');
            }

            if (prev_real_account_loginid) {
                await switchAccount(prev_real_account_loginid);
            } else {
                await switchAccount(account_list.find(acc => !acc.is_virtual && !acc.is_disabled)?.loginid);
            }
        }
        this.selected_account_type = !has_active_real_account ? 'demo' : account_type;
    }

    async switchToCRAccount() {
        const { account_list, switchAccount, prev_real_account_loginid } = this.root_store.client;

        if (prev_real_account_loginid && !prev_real_account_loginid.startsWith('MF')) {
            //switch to previously selected CR account
            await switchAccount(prev_real_account_loginid);
        } else {
            //if no previously selected CR account , then switch to default CR account
            await switchAccount(
                account_list.find(acc => !acc.is_virtual && !acc.is_disabled && !acc.loginid.startsWith('MF'))?.loginid
            );
        }

        this.selected_account_type = 'real';
        this.selected_region = 'Non-EU';
    }

    selectAccountTypeCard(account_type_card) {
        this.account_type_card = account_type_card;
    }

    selectRegion(region) {
        region === 'EU' ? localStorage.setItem('is_eu_user', 'true') : localStorage.removeItem('is_eu_user');
        this.selected_region = region;
    }

    get is_demo_low_risk() {
        const { is_landing_company_loaded } = this.root_store.client;
        if (is_landing_company_loaded) {
            const { financial_company, gaming_company } = this.root_store.client.landing_companies;
            return (
                this.content_flag === ContentFlag.CR_DEMO &&
                financial_company?.shortcode === 'maltainvest' &&
                gaming_company?.shortcode === 'svg'
            );
        }
        return false;
    }

    get content_flag() {
        const { is_logged_in, landing_companies, residence, is_landing_company_loaded } = this.root_store.client;
        if (is_landing_company_loaded) {
            const { financial_company, gaming_company } = landing_companies;

            //this is a conditional check for countries like Australia/Norway which fulfills one of these following conditions
            const restricted_countries = financial_company?.shortcode === 'svg' || gaming_company?.shortcode === 'svg';

            if (!is_logged_in) return '';
            if (!gaming_company?.shortcode && financial_company?.shortcode === 'maltainvest') {
                if (this.is_demo) return ContentFlag.EU_DEMO;
                return ContentFlag.EU_REAL;
            } else if (
                financial_company?.shortcode === 'maltainvest' &&
                gaming_company?.shortcode === 'svg' &&
                this.is_real
            ) {
                if (this.is_eu_user) return ContentFlag.LOW_RISK_CR_EU;
                return ContentFlag.LOW_RISK_CR_NON_EU;
            } else if (
                ((financial_company?.shortcode === 'svg' && gaming_company?.shortcode === 'svg') ||
                    restricted_countries) &&
                this.is_real
            ) {
                return ContentFlag.HIGH_RISK_CR;
            }

            // Default Check
            if (isEuCountry(residence)) {
                if (this.is_demo) return ContentFlag.EU_DEMO;
                return ContentFlag.EU_REAL;
            }
            if (this.is_demo) return ContentFlag.CR_DEMO;
        }
        return ContentFlag.LOW_RISK_CR_NON_EU;
    }

    get show_eu_related_content() {
        const eu_related = [ContentFlag.EU_DEMO, ContentFlag.EU_REAL, ContentFlag.LOW_RISK_CR_EU];
        return eu_related.includes(this.content_flag);
    }

    get is_low_risk_cr_eu_real() {
        return [ContentFlag.LOW_RISK_CR_EU, ContentFlag.EU_REAL].includes(this.content_flag);
    }

    getAvailablePlatforms() {
        const appstore_platforms = getAppstorePlatforms();

        const accounts = JSON.parse(LocalStore.get('client.accounts'));
        const loginid = LocalStore.get('active_loginid');

        if (!accounts || !loginid) return (this.available_platforms = appstore_platforms);

        if (
            isEuCountry(accounts[loginid]?.residence ?? '') ||
            ((this.financial_restricted_countries || this.is_eu_user) && !this.is_demo_low_risk)
        ) {
            this.available_platforms = appstore_platforms.filter(platform =>
                ['EU', 'All'].some(region => region === platform.availability)
            );
            return;
        } else if (
            (this.selected_region === 'Non-EU' && !this.financial_restricted_countries) ||
            this.is_demo_low_risk
        ) {
            this.available_platforms = appstore_platforms.filter(platform =>
                ['Non-EU', 'All'].some(region => region === platform.availability)
            );
            return;
        }
        this.available_platforms = appstore_platforms;
    }

    setIsOnboardingVisited(is_visited) {
        this.is_onboarding_visited = is_visited;
    }

    setIsFirstTimeVisit(is_first_time) {
        this.is_first_time_visit = is_first_time;
    }

    get is_eu_selected() {
        return this.selected_region === 'EU';
    }

    get should_show_exit_traders_modal() {
        //  should display the modal when low risk cr client have atleast one mf account
        const is_low_risk_cr_client = [
            ContentFlag.LOW_RISK_CR_EU,
            ContentFlag.LOW_RISK_CR_NON_EU,
            ContentFlag.CR_DEMO,
        ].includes(this.content_flag);
        const { active_accounts } = this.root_store.client;
        return is_low_risk_cr_client && active_accounts.some(acc => acc.landing_company_shortcode === 'maltainvest');
    }

    toggleRegulatorsCompareModal() {
        this.is_regulators_compare_modal_visible = !this.is_regulators_compare_modal_visible;
    }

    setMT5NotificationModal(is_visible) {
        this.is_mt5_notification_modal_visible = is_visible;
    }

    get has_any_real_account() {
        return this.selected_account_type === 'real' && this.root_store.client.has_active_real_account;
    }

    setTogglePlatformType(platform_type) {
        this.selected_platform_type = platform_type;
    }

    getAvailableCFDAccounts() {
        const getAccountDesc = () => {
            return !this.is_eu_user || this.is_demo_low_risk
                ? localize('CFDs on financial instruments.')
                : localize('CFDs on derived and financial instruments.');
        };
        const getSwapFreeAccountDesc = () => {
            return localize('Swap-free CFDs on selected financial and derived instruments.');
        };

        const all_available_accounts = [
            ...getCFDAvailableAccount(),
            {
                name: !this.is_eu_user || this.is_demo_low_risk ? 'Financial' : 'CFDs',
                description: getAccountDesc(),
                platform: CFD_PLATFORMS.MT5,
                market_type: 'financial',
                icon: !this.is_eu_user || this.is_demo_low_risk ? 'Financial' : 'CFDs',
                availability: 'All',
            },
            {
                name: 'Swap-Free',
                description: getSwapFreeAccountDesc(),
                platform: CFD_PLATFORMS.MT5,
                market_type: 'all',
                icon: 'SwapFree',
                availability: 'Non-EU',
            },
        ];
        this.available_cfd_accounts = all_available_accounts.map(account => {
            return {
                ...account,
                description: account.description,
                //tracking name need not be localised,so added the localization here for the account name.
                tracking_name: account.name,
                name: localize(account.name),
            };
        });
        this.getAvailableDxtradeAccounts();
        this.getAvailableCTraderAccounts();
        this.getAvailableMt5Accounts();
        this.setCombinedCFDMT5Accounts();
    }

    get financial_restricted_countries() {
        const { financial_company, gaming_company } = this.root_store.client.landing_companies;

        return financial_company?.shortcode === 'svg' && !gaming_company;
    }

    get CFDs_restricted_countries() {
        const { financial_company, gaming_company } = this.root_store.client.landing_companies;

        return gaming_company?.shortcode === 'svg' && !financial_company;
    }

    getAvailableMt5Accounts() {
        if (this.is_eu_user && !this.is_demo_low_risk) {
            this.available_mt5_accounts = this.available_cfd_accounts.filter(account =>
                ['EU', 'All'].some(region => region === account.availability)
            );
            return;
        }

        if (this.financial_restricted_countries) {
            this.available_mt5_accounts = this.available_cfd_accounts.filter(
                account => account.market_type === 'financial' && account.platform === CFD_PLATFORMS.MT5
            );
            return;
        }

        if (this.CFDs_restricted_countries) {
            this.available_mt5_accounts = this.available_cfd_accounts.filter(
                account =>
                    account.market_type !== 'financial' &&
                    account.market_type !== 'all' &&
                    account.platform === CFD_PLATFORMS.MT5
            );
            return;
        }

        this.available_mt5_accounts = this.available_cfd_accounts.filter(
            account => account.platform === CFD_PLATFORMS.MT5
        );
    }

    getAvailableDxtradeAccounts() {
        if (this.CFDs_restricted_countries || this.financial_restricted_countries) {
            this.available_dxtrade_accounts = [];
            return;
        }

        if (this.is_eu_user && !this.is_demo_low_risk) {
            this.available_dxtrade_accounts = this.available_cfd_accounts.filter(
                account =>
                    ['EU', 'All'].some(region => region === account.availability) &&
                    account.platform === CFD_PLATFORMS.DXTRADE
            );
            return;
        }

        this.available_dxtrade_accounts = this.available_cfd_accounts.filter(
            account => account.platform === CFD_PLATFORMS.DXTRADE
        );
    }
    getAvailableCTraderAccounts() {
        if (this.CFDs_restricted_countries || this.financial_restricted_countries) {
            this.available_ctrader_accounts = [];
            return;
        }

        if (this.is_eu_user && !this.is_demo_low_risk) {
            this.available_ctrader_accounts = this.available_cfd_accounts.filter(
                account =>
                    ['EU', 'All'].some(region => region === account.availability) &&
                    account.platform === CFD_PLATFORMS.CTRADER
            );
            return;
        }
        this.available_ctrader_accounts = this.available_cfd_accounts.filter(
            account => account.platform === CFD_PLATFORMS.CTRADER
        );
    }

    getExistingAccounts(platform, market_type) {
        const { residence } = this.root_store.client;
        const current_list = this.root_store.modules?.cfd?.current_list || [];
        const current_list_keys = Object.keys(current_list);
        const selected_account_type = this.selected_account_type;
        const existing_accounts = current_list_keys
            .filter(key => {
                const maltainvest_account = current_list[key].landing_company_short === 'maltainvest';

                if (platform === CFD_PLATFORMS.MT5 && !this.is_eu_user && !maltainvest_account) {
                    return key.startsWith(`${platform}.${selected_account_type}.${market_type}`);
                }
                if (platform === CFD_PLATFORMS.MT5 && market_type === 'all') {
                    return key.startsWith(`${platform}.${selected_account_type}.${platform}@${market_type}`);
                }
                if (platform === CFD_PLATFORMS.DXTRADE && market_type === 'all') {
                    return key.startsWith(`${platform}.${selected_account_type}.${platform}@${market_type}`);
                }
                if (platform === CFD_PLATFORMS.CTRADER && market_type === 'all') {
                    return key.startsWith(`${platform}.${selected_account_type}.${platform}@${market_type}`);
                }
                if (
                    platform === CFD_PLATFORMS.MT5 &&
                    (this.is_eu_user || isEuCountry(residence)) &&
                    maltainvest_account
                ) {
                    return key.startsWith(`${platform}.${selected_account_type}.${market_type}`);
                }

                return key.startsWith(`${platform}.${selected_account_type}.${market_type}@${market_type}`);
            })
            .reduce((_acc, cur) => {
                _acc.push(current_list[cur]);
                return _acc;
            }, []);
        return existing_accounts;
    }

    startTrade(platform, account) {
        const { common, modules } = this.root_store;
        const { toggleMT5TradeModal, setMT5TradeAccount } = modules.cfd;
        const { setAppstorePlatform } = common;
        setAppstorePlatform(platform);
        toggleMT5TradeModal();
        setMT5TradeAccount(account);
    }

    get is_demo() {
        return this.selected_account_type === 'demo';
    }
    get is_real() {
        return this.selected_account_type === 'real';
    }
    get is_eu_user() {
        // directly return the user's region selection from localStorage or the selected region from the store
        return localStorage.getItem('is_eu_user') === 'true' || this.selected_region === 'EU';
    }

    handleTabItemClick(idx) {
        if (idx === 0) {
            this.selected_region = 'Non-EU';
        } else {
            this.selected_region = 'EU';
        }
    }

    async openDemoCFDAccount(account_type, platform) {
        const { modules } = this.root_store;
        const { createCFDAccount, enableCFDPasswordModal } = modules.cfd;

        if (platform !== CFD_PLATFORMS.CTRADER) {
            enableCFDPasswordModal();
        } else {
            await createCFDAccount({ ...account_type, platform });
        }
    }

    async openRealAccount(account_type, platform) {
        const { client, modules } = this.root_store;
        const { has_active_real_account } = client;
        const { createCFDAccount, enableCFDPasswordModal, toggleJurisdictionModal } = modules.cfd;
        if (has_active_real_account && platform === CFD_PLATFORMS.MT5) {
            toggleJurisdictionModal();
        } else if (platform === CFD_PLATFORMS.DXTRADE) {
            enableCFDPasswordModal();
        } else {
            await createCFDAccount({ ...account_type, platform });
        }
    }

    openModal(modal_id, props = {}) {
        this.modal_data = {
            active_modal: modal_id,
            data: props,
        };
    }

    closeModal() {
        this.modal_data = {
            active_modal: '',
            data: {},
        };
    }

    selectRealLoginid(loginid) {
        const { accounts } = this.root_store.client;
        if (Object.keys(accounts).includes(loginid)) {
            this.selected_loginid = loginid;
        }
    }

    getAccount() {
        const { modules, common } = this.root_store;
        const { account_type } = modules.cfd;
        const { platform } = common;
        if (this.is_demo) {
            this.openDemoCFDAccount(account_type, platform);
        } else {
            this.openRealAccount(account_type, platform);
        }
    }

    getServerName = account => {
        if (account) {
            const server_region = account.server_info?.geolocation?.region;
            if (server_region) {
                return `${server_region} ${
                    account?.server_info?.geolocation?.sequence === 1 ? '' : account?.server_info?.geolocation?.sequence
                }`;
            }
        }
        return '';
    };
    hasMultipleSVGAccounts = () => {
        const all_svg_acc = [];
        this.combined_cfd_mt5_accounts.map(acc => {
            if (acc.landing_company_short === 'svg' && acc.market_type === 'synthetic') {
                if (all_svg_acc.length) {
                    all_svg_acc.forEach(svg_acc => {
                        if (svg_acc.server !== acc.server) all_svg_acc.push(acc);
                        return all_svg_acc;
                    });
                } else {
                    all_svg_acc.push(acc);
                }
            }
        });
        return all_svg_acc.length > 1;
    };
    getShortCodeAndRegion(account) {
        let short_code_and_region;
        if (this.is_real && !this.is_eu_user) {
            const short_code =
                account.landing_company_short &&
                account.landing_company_short !== 'svg' &&
                account.landing_company_short !== 'bvi'
                    ? account.landing_company_short?.charAt(0).toUpperCase() + account.landing_company_short?.slice(1)
                    : account.landing_company_short?.toUpperCase();

            let region = '';
            if (this.hasMultipleSVGAccounts()) {
                region =
                    account.market_type !== 'financial' && account.landing_company_short !== 'bvi'
                        ? ` - ${this.getServerName(account)}`
                        : '';
            }
            short_code_and_region = `${short_code}${region}`;
        }
        return short_code_and_region;
    }
    setCombinedCFDMT5Accounts() {
        this.combined_cfd_mt5_accounts = [];
        this.available_mt5_accounts?.forEach(account => {
            const existing_accounts = this.getExistingAccounts(account.platform, account.market_type);
            const has_existing_accounts = existing_accounts.length > 0;
            if (has_existing_accounts) {
                existing_accounts.forEach(existing_account => {
                    this.combined_cfd_mt5_accounts = [
                        ...this.combined_cfd_mt5_accounts,
                        {
                            ...existing_account,
                            icon: account.icon,
                            sub_title: account.name,
                            name: `${formatMoney(existing_account.currency, existing_account.display_balance, true)} ${
                                existing_account.currency
                            }`,
                            short_code_and_region: this.getShortCodeAndRegion(existing_account),
                            platform: account.platform,
                            description: existing_account.display_login,
                            key: `trading_app_card_${existing_account.display_login}`,
                            action_type: 'multi-action',
                            availability: this.selected_region,
                            market_type: account.market_type,
                            tracking_name: account.tracking_name,
                        },
                    ];
                });
            } else {
                this.combined_cfd_mt5_accounts = [
                    ...this.combined_cfd_mt5_accounts,
                    {
                        icon: account.icon,
                        name: account.name,
                        platform: account.platform,
                        description: account.description,
                        key: `trading_app_card_${account.name}`,
                        action_type: 'get',
                        availability: this.selected_region,
                        market_type: account.market_type,
                        tracking_name: account.tracking_name,
                    },
                ];
            }
        });
    }

    closeAccountTransferModal() {
        this.is_account_transfer_modal_open = false;
    }

    toggleAccountTransferModal() {
        this.is_account_transfer_modal_open = !this.is_account_transfer_modal_open;
    }

    toggleFailedVerificationModalVisibility() {
        this.is_failed_verification_modal_visible = !this.is_failed_verification_modal_visible;
    }

    setMT5ExistingAccount(existing_account) {
        this.mt5_existing_account = existing_account;
    }

    openFailedVerificationModal(selected_account_type) {
        const {
            common,
            modules: { cfd },
        } = this.root_store;
        const { setJurisdictionSelectedShortcode, setAccountType } = cfd;
        const { setAppstorePlatform } = common;

        if (selected_account_type?.platform === CFD_PLATFORMS.MT5) {
            setAppstorePlatform(selected_account_type.platform);
            setAccountType({
                category: selected_account_type.category,
                type: selected_account_type.type,
            });
            this.setMT5ExistingAccount(selected_account_type);
            setJurisdictionSelectedShortcode(selected_account_type.jurisdiction);
        } else {
            setJurisdictionSelectedShortcode('');
        }
        this.open_failed_verification_for =
            selected_account_type?.platform === CFD_PLATFORMS.MT5 ? selected_account_type?.jurisdiction : 'multipliers';
        this.toggleFailedVerificationModalVisibility();
    }

    showTopUpModal(data) {
        const { ui, modules } = this.root_store;
        const { openTopUpModal } = ui;
        const { setCurrentAccount } = modules.cfd;
        setCurrentAccount(data, {
            category: this.selected_account_type,
            type: data.market_type,
        });
        openTopUpModal();
    }

    toggleWalletsUpgrade(value) {
        this.is_real_wallets_upgrade_on = value;
    }

    setWalletsMigrationFailedPopup(value) {
        this.is_wallet_migration_failed = value;
    }
}
