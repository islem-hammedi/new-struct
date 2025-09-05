import React from "react";

const WHATSAPP_NUMBER = "216 23 443 748"; 
const WhatsAppPhoneFloating: React.FC = () => {
  const handleClick = () => {
    const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}`;
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

    window.location.href = appUrl;
    setTimeout(() => {
      window.open(webUrl, "_blank");
    }, 1000);
  };

  return (
    <button
      type="button"
      aria-label="WhatsApp"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-teal-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.45l.7 2.11a2 2 0 01-.45 2.11l-1.27 1.27a11.042 11.042 0 005.02 5.02l1.27-1.27a2 2 0 012.11-.45l2.11.7A2 2 0 0119 18.72V21a2 2 0 01-2 2h0C7.61 23 1 16.39 1 8a2 2 0 012-2z"
        />
      </svg>
    </button>
  );
};

export default WhatsAppPhoneFloating;