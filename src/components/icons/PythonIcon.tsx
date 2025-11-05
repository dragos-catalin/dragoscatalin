interface PythonIconProps {
    className?: string;
}

const PythonIcon: React.FC<PythonIconProps> = ({ className = "w-5 h-5" }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.202S18.28 0 11.914 0zM8.66 1.848a1.034 1.034 0 110 2.067 1.034 1.034 0 010-2.067z"
                fill="url(#paint0_linear_python)"
            />
            <path
                d="M12.087 24c6.092 0 5.712-2.656 5.712-2.656l-.007-2.752h-5.814v-.826h8.121s3.9.445 3.9-5.735c0-6.18-3.403-5.96-3.403-5.96h-2.03v2.867s.109 3.42-3.35 3.42h-5.766s-3.24-.052-3.24 3.148v5.292S5.72 24 12.087 24zm3.254-1.848a1.034 1.034 0 110-2.067 1.034 1.034 0 010 2.067z"
                fill="url(#paint1_linear_python)"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_python"
                    x1="6.168"
                    y1="1.296"
                    x2="14.126"
                    y2="15.765"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#387EB8" />
                    <stop offset="1" stopColor="#366994" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_python"
                    x1="17.832"
                    y1="22.704"
                    x2="9.874"
                    y2="8.235"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#FFE873" />
                    <stop offset="1" stopColor="#FFD43B" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default PythonIcon;
