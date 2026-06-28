import { HStack, Text, Tooltip } from '@chakra-ui/react';
import { useStatsRank } from '../context/StatsRankContext';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RankBadge = ({ rank, label }) => {
  if (!rank) return null;

  const medal = MEDALS[rank.rank];
  const tooltip = `${label}: #${rank.rank} of ${rank.totalUsers} today`;

  if (medal) {
    return (
      <Tooltip label={tooltip} hasArrow>
        <Text fontSize="4xl" lineHeight={1} cursor="default">
          {medal}
        </Text>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={tooltip} hasArrow>
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="gray.600"
        px={2}
        py={1}
        borderWidth={1}
        borderRadius="md"
        borderColor="gray.300"
        cursor="default"
      >
        #{rank.rank}
      </Text>
    </Tooltip>
  );
};

const RankMedals = () => {
  const { rank, loaded } = useStatsRank();

  if (!loaded) return null;

  const hasProcessed = !!rank?.processed;
  const hasNormal = !!rank?.normal;

  if (!hasProcessed && !hasNormal) {
    return (
      <Tooltip label="No rank yet — add stats today to appear on the leaderboard" hasArrow>
        <Text fontSize="xs" color="gray.400" cursor="default">
          Unranked
        </Text>
      </Tooltip>
    );
  }

  return (
    <HStack spacing={2}>
      <RankBadge rank={rank.processed} label="Processed" />
      <RankBadge rank={rank.normal} label="Accuracy" />
    </HStack>
  );
};

export default RankMedals;
