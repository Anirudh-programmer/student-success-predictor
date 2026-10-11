import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ResponsibleAIDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className={`bg-[#F9F7F1] border border-[#E6E0D2] rounded-xl p-4.5 text-[#202D29] ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-[#EFECE0] text-[#173F35] shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-[#173F35]" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-xs tracking-wider uppercase text-[#102E27]">
            Responsible AI & Pedagogical Advisory Notice
          </p>
          <p className="text-xs text-[#52605A] leading-relaxed">
            Predicted scores and readiness indicators represent statistical approximations derived from historical cohort associations. 
            They are designed strictly to assist faculty mentors, academic counselors, and students in formulating constructive study plans and early support interventions. 
            They must never be used for punitive decisions, automated grading, or barriers to educational opportunity.
          </p>
        </div>
      </div>
    </div>
  );
};
