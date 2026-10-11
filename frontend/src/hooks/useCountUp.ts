import { useState, useEffect } from 'react';

interface CountUpOptions {
  duration?: number; // milliseconds
}

/**
 * Custom hook to animate numeric display values from zero (or starting baseline)
 * to the target value with easeOutCubic curve, respecting prefers-reduced-motion.
 */
export function useCountUp(target: string | number, options: CountUpOptions = {}) {
  const { duration = 850 } = options;
  const targetStr = String(target);

  // Check if reduced motion is preferred
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Extract prefix (e.g., '±'), suffix, commas, and numeric magnitude
  const prefixMatch = targetStr.match(/^[^\d.-]*/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  const suffixMatch = targetStr.match(/[^\d.]*$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const cleanNumStr = targetStr.slice(prefix.length, targetStr.length - suffix.length).replace(/,/g, '');
  const numericVal = parseFloat(cleanNumStr);
  const hasDecimals = cleanNumStr.includes('.');
  const decimalPlaces = hasDecimals ? (cleanNumStr.split('.')[1]?.length || 0) : 0;
  const hasCommas = targetStr.includes(',');

  const [currentVal, setCurrentVal] = useState<number>(() => {
    if (prefersReducedMotion || isNaN(numericVal)) return numericVal;
    return 0;
  });

  useEffect(() => {
    if (prefersReducedMotion || isNaN(numericVal)) {
      setCurrentVal(numericVal);
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const startVal = 0;
    const diff = numericVal - startVal;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic curve: 1 - Math.pow(1 - progress, 3)
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = startVal + diff * ease;

      setCurrentVal(val);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCurrentVal(numericVal);
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [numericVal, duration, prefersReducedMotion]);

  if (isNaN(numericVal)) {
    return targetStr;
  }

  // Format formatted string
  let formattedNumber = currentVal.toFixed(decimalPlaces);
  if (hasCommas) {
    const parts = formattedNumber.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formattedNumber = parts.join('.');
  }

  return `${prefix}${formattedNumber}${suffix}`;
}
