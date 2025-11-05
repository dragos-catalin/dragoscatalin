interface AIIconProps {
    className?: string;
}

const AIIcon: React.FC<AIIconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                stroke="url(#paint0_linear_ai)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 22v-10"
                stroke="url(#paint1_linear_ai)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 12L3 7M12 12l9-5M12 12v10"
                stroke="url(#paint2_linear_ai)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2" fill="url(#paint3_radial_ai)" />
            <circle cx="7" cy="9" r="1" fill="url(#paint4_radial_ai)" />
            <circle cx="17" cy="9" r="1" fill="url(#paint5_radial_ai)" />
            <circle cx="7" cy="15" r="1" fill="url(#paint6_radial_ai)" />
            <circle cx="17" cy="15" r="1" fill="url(#paint7_radial_ai)" />
            <defs>
                <linearGradient
                    id="paint0_linear_ai"
                    x1="3"
                    y1="7"
                    x2="21"
                    y2="17"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_ai"
                    x1="12"
                    y1="12"
                    x2="12"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_ai"
                    x1="3"
                    y1="7"
                    x2="21"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#06B6D4" />
                    <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
                <radialGradient
                    id="paint3_radial_ai"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(12 12) rotate(90) scale(2)"
                >
                    <stop stopColor="#60A5FA" />
                    <stop offset="1" stopColor="#3B82F6" />
                </radialGradient>
                <radialGradient
                    id="paint4_radial_ai"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(7 9) scale(1)"
                >
                    <stop stopColor="#A78BFA" />
                    <stop offset="1" stopColor="#8B5CF6" />
                </radialGradient>
                <radialGradient
                    id="paint5_radial_ai"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(17 9) scale(1)"
                >
                    <stop stopColor="#A78BFA" />
                    <stop offset="1" stopColor="#8B5CF6" />
                </radialGradient>
                <radialGradient
                    id="paint6_radial_ai"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(7 15) scale(1)"
                >
                    <stop stopColor="#67E8F9" />
                    <stop offset="1" stopColor="#06B6D4" />
                </radialGradient>
                <radialGradient
                    id="paint7_radial_ai"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(17 15) scale(1)"
                >
                    <stop stopColor="#67E8F9" />
                    <stop offset="1" stopColor="#06B6D4" />
                </radialGradient>
            </defs>
        </svg>
    );
};

export default AIIcon;
