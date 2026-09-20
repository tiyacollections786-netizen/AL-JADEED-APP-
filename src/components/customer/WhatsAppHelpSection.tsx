import React from 'react';
import { WhatsAppSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  buildWhatsAppSupportUrl,
  formatDisplayWhatsAppNumber,
} from '../../utils/whatsapp';
import { api } from '../../services/api';
import { MessageCircle, Radio, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface WhatsAppHelpSectionProps {
  whatsappSettings?: WhatsAppSettings;
  className?: string;
}

export const WhatsAppHelpSection: React.FC<WhatsAppHelpSectionProps> = ({
  whatsappSettings,
  className = '',
}) => {
  // If settings not provided or both support & channel are disabled, hide complete section
  if (!whatsappSettings) return null;

  const { support, channel } = whatsappSettings;
  const isSupportEnabled = support?.enabled && Boolean(support.number?.trim());
  const isChannelEnabled = channel?.enabled && Boolean(channel.channelUrl?.trim());

  if (!isSupportEnabled && !isChannelEnabled) {
    return null;
  }

  const handleSupportClick = () => {
    api.trackAnalytics('whatsapp_support');
    const url = buildWhatsAppSupportUrl(support.number, support.welcomeMessage);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleChannelClick = () => {
    api.trackAnalytics('whatsapp_channel');
    if (channel.channelUrl) {
      window.open(channel.channelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const displayPhone = formatDisplayWhatsAppNumber(support?.number || '');

  return (
    <div
      id="whatsapp-community-support-section"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1b0a3d] to-[#120529] border border-purple-500/30 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/20 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.25)] shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Need Help & Updates?
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-purple-300/80">
              Connect with our dedicated support team or join our verified community channel
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-purple-400/80 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Al Jadeed Verified Desk</span>
        </div>
      </div>

      {/* Two Column Grid on Desktop, Stacked on Mobile */}
      <div
        className={`grid gap-4 ${
          isSupportEnabled && isChannelEnabled ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Card 1: WhatsApp Support */}
        {isSupportEnabled && (
          <div
            id="whatsapp-support-card"
            className="group relative flex flex-col justify-between rounded-2xl bg-[#0e0422]/90 border border-purple-500/25 p-4 sm:p-5 hover:border-emerald-500/40 hover:bg-[#13072e] transition-all duration-200 hover:shadow-[0_8px_25px_rgba(37,211,102,0.15)]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {support.displayName || 'WhatsApp Support'}
                    </h4>
                    <span className="text-[11px] text-purple-300/70 font-mono">
                      {displayPhone}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-purple-900/50 text-purple-300 text-[10px] font-medium border border-purple-500/20">
                  Instant Reply
                </span>
              </div>

              <p className="text-xs text-purple-200/90 leading-relaxed">
                Have questions about your hen earnings, egg sales, or payment verifications? Chat directly with our support team.
              </p>
            </div>

            <div className="pt-4 mt-2 border-t border-purple-500/15">
              <button
                type="button"
                id="btn-open-whatsapp-support"
                onClick={handleSupportClick}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-[#128C7E] hover:from-emerald-500 hover:to-[#25D366] text-white font-semibold text-xs rounded-xl shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>Open WhatsApp Support</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        )}

        {/* Card 2: WhatsApp Channel */}
        {isChannelEnabled && (
          <div
            id="whatsapp-channel-card"
            className="group relative flex flex-col justify-between rounded-2xl bg-[#0e0422]/90 border border-purple-500/25 p-4 sm:p-5 hover:border-emerald-500/40 hover:bg-[#13072e] transition-all duration-200 hover:shadow-[0_8px_25px_rgba(37,211,102,0.15)]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Radio className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                      {channel.channelName || 'Official WhatsApp Channel'}
                    </h4>
                    <span className="text-[11px] text-purple-300/70">
                      Broadcast & Announcements
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/25">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Updates
                </span>
              </div>

              <p className="text-xs text-purple-200/90 leading-relaxed">
                {channel.description || 'Get real-time farm notices, egg production cycles, bonus announcements, and platform news.'}
              </p>
            </div>

            <div className="pt-4 mt-2 border-t border-purple-500/15">
              <button
                type="button"
                id="btn-join-whatsapp-channel"
                onClick={handleChannelClick}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-[#128C7E] hover:from-purple-600 hover:via-indigo-500 hover:to-emerald-500 text-white font-semibold text-xs rounded-xl shadow-[0_4px_14px_rgba(147,51,234,0.25)] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>Join Official Channel</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
