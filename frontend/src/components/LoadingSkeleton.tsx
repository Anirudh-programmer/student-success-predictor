import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-8 bg-[#E6EEE5] rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-[#E6EEE5]/80 rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-[#E6EEE5]/70 rounded-xl"></div>
      {Array.from({ length: rows - 2 }).map((_, i) => (
        <div key={i} className="h-12 bg-[#E6EEE5]/60 rounded-lg"></div>
      ))}
    </div>
  );
};
