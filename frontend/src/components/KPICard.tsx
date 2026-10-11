import { useCountUp } from '../hooks/useCountUp';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'forest' | 'sage' | 'gold' | 'neutral' | 'amber';
  };
  icon?: React.ReactNode;
  animate?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  badge,
  icon,
  animate = true
}) => {
  const animatedValue = useCountUp(value);
  const displayValue = animate ? animatedValue : value;

  const badgeStyles = {
    forest: 'bg-[#E6EEE5] text-[#173F35] border-[#D2DDD0]',
    sage: 'bg-[#F0F4EF] text-[#3B5B44] border-[#DCE4DB]',
    gold: 'bg-[#FAF6EC] text-[#8A6D2D] border-[#EADFC7]',
    neutral: 'bg-[#F7F5EF] text-[#66736D] border-[#E2E7E0]',
    amber: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
  }[badge?.variant || 'forest'];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E7E0] p-5 shadow-2xs card-hover-lift flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#66736D] m-0">{title}</p>
          {icon && (
            <div className="text-[#173F35] p-2 rounded-xl bg-[#F0F5EE] border border-[#E4ECE2] shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-[#102E27] font-tabular">{displayValue}</span>
          {unit && <span className="text-sm font-semibold text-[#66736D]">{unit}</span>}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F2F4F0] flex items-center justify-between text-xs">
        {subtitle && <span className="text-[#66736D] text-[11px] font-medium">{subtitle}</span>}
        {badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
