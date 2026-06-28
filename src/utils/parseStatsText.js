const STAT_PATTERNS = [
  { key: 'processed', label: 'Processed', regex: /Processed\s+(\d+)\s*\/\s*(\d+)/i, type: 'fraction' },
  { key: 'normal', label: 'Normal', regex: /Normal\s+(\d+)/i },
  { key: 'underHour', label: 'Under Hour', regex: /Under hour\s+(\d+)/i },
  { key: 'cancelled', label: 'Cancelled', regex: /Cancelled\s+(\d+)/i },
  { key: 'skipped', label: 'Skipped', regex: /Skipped\s+(\d+)/i },
  { key: 'failed', label: 'Failed', regex: /Failed\s+(\d+)/i },
];

export const parseStatsText = (text) => {
  if (!text?.trim()) {
    return { stats: null, error: null };
  }

  const stats = {};
  let matched = 0;

  for (const pattern of STAT_PATTERNS) {
    const match = text.match(pattern.regex);
    if (!match) continue;

    matched += 1;

    if (pattern.type === 'fraction') {
      stats.processed = {
        completed: Number(match[1]),
        total: Number(match[2]),
      };
    } else {
      stats[pattern.key] = Number(match[1]);
    }
  }

  if (matched === 0) {
    return {
      stats: null,
      error: 'Could not save stats. ',
    };
  }

  return { stats, error: null };
};

export const STAT_LABELS = STAT_PATTERNS.filter((p) => p.type !== 'fraction');
