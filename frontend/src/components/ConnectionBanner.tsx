import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface ConnectionBannerProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  error,
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="bg-[#FEF9EE] border border-[#F1DFC0] rounded-xl p-5 text-[#78350F] shadow-2xs mb-6">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-[#FDEECA] text-[#92400E] rounded-lg shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[#78350F]">Backend Connection Notice</h3>
          <p className="text-xs text-[#92400E] mt-1 leading-relaxed">{error}</p>
          <div className="mt-3 bg-[#FDF4DF] rounded-md p-2.5 text-[11px] font-mono text-[#78350F] border border-[#F3E2BD]">
            Target URL: {API_BASE_URL}
            <br />
            {API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1') ? (
              <>Local startup command: <span className="font-bold">py -3.12 -m uvicorn app.main:app --host 127.0.0.1 --port 8000</span> (in <span className="font-bold">backend/</span>)</>
            ) : (
              <>Production note: <span className="font-bold">Render Free Tier services spin down after inactivity</span>. The initial wake-up may take 40-50 seconds. Please retry shortly.</>
            )}
          </div>
          <div className="mt-3">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173F35] hover:bg-[#102E27] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Checking connection...' : 'Retry Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
