
import React from 'react';
import { ConfidenceLevel } from '../types';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level }) => {
  const config = {
    GREEN: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢', label: 'High Confidence' },
    YELLOW: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡', label: 'Medium Confidence' },
    RED: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴', label: 'Low Confidence' },
  };

  const current = config[level];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${current.color}`}>
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </div>
  );
};
