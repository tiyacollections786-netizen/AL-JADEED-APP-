import React from 'react';
import { WhatsAppSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { buildWhatsAppSupportUrl } from '../../utils/whatsapp';
import { api } from '../../services/api';

interface WhatsAppFloatingButtonProps {
  whatsappSettings?: WhatsAppSettings;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  whatsappSettings,
}) => {
  if (!whatsappSettings) return null;

  const { support } = whatsappSettings;
  // Check if support is enabled, has a valid phone number, and floating button is allowed
  if (!support?.enabled || !support?.enableFloatingButton || !support?.number?.trim()) {
    return null;
  }

  const handleFloatingClick = () => {
    api.trackAnalytics('whatsapp_support');
    const url = buildWhatsAppSupportUrl(support.number, support.welcomeMessage);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      id="whatsapp-floating-support-container"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 transition-all duration-300"
    >
      <button
        type="button"
        id="btn-whatsapp-floating-support"
        onClick={handleFloatingClick}
        aria-label="Chat with WhatsApp Support"
        title="Chat with Al Jadeed WhatsApp Support"
        className="group relative flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f7a6e] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/40"
      >
        {/* Pulsing ring indicator */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-60 blur-sm animate-pulse" />

        <div className="relative flex items-center justify-center">
          <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        </div>

        {/* Text is hidden on mobile screens to stay compact, visible on tablets/desktops */}
        <span className="relative hidden sm:inline-block font-bold text-xs tracking-wide pr-1">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
};
