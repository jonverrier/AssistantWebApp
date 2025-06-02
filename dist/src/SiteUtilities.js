"use strict";
/**
 * PageUtilities.tsx
 *
 * A collection of utility components for the page.
 */
/*! Copyright Jon Verrier 2025 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = exports.Spacer = exports.ESpacerSize = exports.Header = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const CommonStyles_1 = require("./CommonStyles");
const UIStrings_1 = require("./UIStrings");
const react_components_1 = require("@fluentui/react-components");
const captcha_1 = require("./captcha");
const ConfigStrings_1 = require("./ConfigStrings");
const AssistantChatApiTypes_1 = require("../import/AssistantChatApiTypes");
const UserContext_1 = require("./UserContext");
const MOBILE_BREAKPOINT = 512;
const useFooterStyles = (0, react_components_1.makeStyles)({
    footerContainer: {
        backgroundColor: 'var(--colorNeutralBackground1)',
        ...react_components_1.shorthands.padding('12px'),
        ...react_components_1.shorthands.borderTop('1px', 'solid', 'var(--colorNeutralStroke1)'),
        width: '100%',
        marginTop: 'auto'
    },
    footerContent: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        [`@media (max-width: ${MOBILE_BREAKPOINT}px)`]: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
        },
    },
});
const Header = ({ title }) => {
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const lifterIcon = 'assets/img/lifter-w.png';
    return (react_1.default.createElement("div", { style: { position: 'relative', width: '100%', textAlign: 'center' } },
        react_1.default.createElement(react_components_1.Image, { src: lifterIcon, alt: "Menu Icon", style: {
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)'
            } }),
        react_1.default.createElement("div", { style: { display: 'inline-block' } },
            react_1.default.createElement(react_components_1.Text, { className: textClasses.heading }, title))));
};
exports.Header = Header;
var ESpacerSize;
(function (ESpacerSize) {
    ESpacerSize[ESpacerSize["kSmall"] = 8] = "kSmall";
    ESpacerSize[ESpacerSize["kMedium"] = 14] = "kMedium";
    ESpacerSize[ESpacerSize["kLarge"] = 20] = "kLarge";
    ESpacerSize[ESpacerSize["kXLarge"] = 32] = "kXLarge";
})(ESpacerSize || (exports.ESpacerSize = ESpacerSize = {}));
const Spacer = (props) => {
    const size = props.size ?? ESpacerSize.kMedium;
    return (react_1.default.createElement("div", { style: { height: `${size}px` } }));
};
exports.Spacer = Spacer;
const Footer = (props) => {
    const user = (0, UserContext_1.useUser)();
    const personality = user?.personality ?? AssistantChatApiTypes_1.EAssistantPersonality.kDemoAssistant;
    const uiStrings = (0, UIStrings_1.getUIStrings)(personality);
    const linkClasses = (0, CommonStyles_1.standardLinkStyles)();
    const styles = useFooterStyles();
    const footerRef = (0, react_1.useRef)(null);
    const config = (0, ConfigStrings_1.getConfigStrings)();
    const textClasses = (0, CommonStyles_1.standardTextStyles)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleLinkClick = async (action, path) => {
        // Call reCAPTCHA before navigation
        // We throw away the result - we are recording actions as per the Google guidance     
        const captchaResult = await (0, captcha_1.executeReCaptcha)(config.captchaApiUrl, action);
        navigate(path);
    };
    (0, react_1.useEffect)(() => {
        const updateFooterHeight = () => {
            if (footerRef.current) {
                const height = footerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--footer-height', `${height}px`);
            }
        };
        updateFooterHeight();
        window.addEventListener('resize', updateFooterHeight);
        return () => window.removeEventListener('resize', updateFooterHeight);
    }, []);
    return (react_1.default.createElement("div", { ref: footerRef, className: styles.footerContainer },
        react_1.default.createElement("div", { className: styles.footerContent },
            react_1.default.createElement(react_router_dom_1.Link, { to: "/", className: linkClasses.centred, onClick: (e) => {
                    e.preventDefault();
                    handleLinkClick(config.homeAction, '/');
                } }, uiStrings.kHome),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/chat", className: linkClasses.centred, onClick: (e) => {
                    e.preventDefault();
                    handleLinkClick(config.aboutAction, '/chat');
                } }, uiStrings.kChat),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/privacy", className: linkClasses.centred, onClick: (e) => {
                    e.preventDefault();
                    handleLinkClick(config.privacyAction, '/privacy');
                } }, uiStrings.kPrivacy),
            react_1.default.createElement(react_router_dom_1.Link, { to: "/terms", className: linkClasses.centred, onClick: (e) => {
                    e.preventDefault();
                    handleLinkClick(config.termsAction, '/terms');
                } }, uiStrings.kTerms)),
        react_1.default.createElement("div", { style: { textAlign: 'center' } },
            react_1.default.createElement(react_components_1.Text, { className: textClasses.footer }, "\u00A9 2025 Strong AI Technologies Ltd"))));
};
exports.Footer = Footer;
