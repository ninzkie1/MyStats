import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { getLeaderboard } from '../services/api';
import { useStatsRank } from '../context/StatsRankContext';

const rankStyles = {
  1: { bg: 'yellow.100', border: 'yellow.400', label: 'Top 1', medal: '🥇' },
  2: { bg: 'gray.100', border: 'gray.400', label: 'Top 2', medal: '🥈' },
  3: { bg: 'orange.100', border: 'orange.400', label: 'Top 3', medal: '🥉' },
};

const Leaderboard = () => {
  const [byProcessed, setByProcessed] = useState([]);
  const [byNormal, setByNormal] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { refreshRank } = useStatsRank();

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await getLeaderboard();
      setByProcessed(response.data.byProcessed);
      setByNormal(response.data.byNormal);
      await refreshRank();
    } catch (error) {
      toast({
        title: 'Failed to load leaderboard',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, refreshRank]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Leaderboard</Heading>
        <Text color="gray.500" fontSize="sm">Today&apos;s rankings — resets each day at midnight</Text>

        {loading ? (
          <Text color="gray.500">Loading rankings...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <LeaderboardPanel
              title="Highest Processed"
              subtitle="Ranked by total processed count"
              entries={byProcessed}
              valueKey="totalProcessed"
              valueLabel="Processed"
            />
            <LeaderboardPanel
              title="Highest Accuracy"
              subtitle="Ranked by total normal count"
              entries={byNormal}
              valueKey="totalNormal"
              valueLabel="Normal"
              showAccuracy
            />
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

const LeaderboardPanel = ({
  title,
  subtitle,
  entries,
  valueKey,
  valueLabel,
  showAccuracy = false,
}) => (
  <Box p={6} bg="white" borderRadius={8} boxShadow="md">
    <Heading size="md" mb={1}>
      {title}
    </Heading>
    <Text fontSize="sm" color="gray.500" mb={4}>
      {subtitle}
    </Text>

    {entries.length === 0 ? (
      <Text color="gray.500">No stats recorded yet.</Text>
    ) : (
      <VStack spacing={3} align="stretch">
        {entries.map((entry) => (
          <LeaderboardRow
            key={`${title}-${entry.userId}`}
            entry={entry}
            valueKey={valueKey}
            valueLabel={valueLabel}
            showAccuracy={showAccuracy}
          />
        ))}
      </VStack>
    )}
  </Box>
);

const LeaderboardRow = ({ entry, valueKey, valueLabel, showAccuracy }) => {
  const style = rankStyles[entry.rank];
  const isTopThree = entry.rank <= 3;

  return (
    <Flex
      p={4}
      borderRadius={8}
      borderWidth={isTopThree ? 2 : 1}
      borderColor={isTopThree ? style.border : 'gray.200'}
      bg={isTopThree ? style.bg : 'white'}
      align="center"
      justify="space-between"
      gap={3}
    >
      <HStack spacing={3} flex={1}>
        <Text fontSize="xl" fontWeight="bold" minW="2.5rem">
          {isTopThree ? style.medal : `#${entry.rank}`}
        </Text>
        <Box>
          <HStack>
            <Text fontWeight="semibold">{entry.username}</Text>
            {isTopThree && (
              <Badge colorScheme={entry.rank === 1 ? 'yellow' : entry.rank === 2 ? 'gray' : 'orange'}>
                {style.label}
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {entry.entryCount} {entry.entryCount === 1 ? 'entry' : 'entries'}
          </Text>
        </Box>
      </HStack>

      <Box textAlign="right">
        <Text fontWeight="bold" fontSize="lg" color="blue.600">
          {entry[valueKey]} {valueLabel}
        </Text>
        {showAccuracy && (
          <Text fontSize="xs" color="gray.500">
            {entry.accuracy}% accuracy
          </Text>
        )}
        {!showAccuracy && entry.totalNormal !== undefined && (
          <Text fontSize="xs" color="gray.500">
            {entry.totalNormal} normal
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default Leaderboard;
