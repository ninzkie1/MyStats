import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { parseStatsText } from '../utils/parseStatsText';
import { useStatsRank } from '../context/StatsRankContext';
import { getStatsEntries, getDashboardSummary, addStatsEntry, deleteStatsEntry } from '../services/api';

const PAGE_SIZE = 5;

const statColors = {
  normal: 'green.500',
  underHour: 'blue.500',
  cancelled: 'orange.500',
  skipped: 'gray.500',
  failed: 'red.500',
};

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalEntries: 0,
    totalPages: 1,
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { refreshRank } = useStatsRank();

  const loadSummary = useCallback(async () => {
    try {
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (error) {
      toast({
        title: 'Failed to load summary',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const loadEntries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await getStatsEntries(page, PAGE_SIZE);
      setEntries(response.data.entries);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Failed to load stats',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshDashboard = useCallback(async (page = 1) => {
    await Promise.all([loadEntries(page), loadSummary(), refreshRank()]);
  }, [loadEntries, loadSummary, refreshRank]);

  useEffect(() => {
    refreshDashboard(1);
  }, [refreshDashboard]);

  const handleAdd = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const { error } = parseStatsText(trimmed);
    if (error) {
      toast({
        title: 'Save failed',
        description: error,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      await addStatsEntry(trimmed);
      setInputText('');
      await refreshDashboard(1);
      toast({
        title: 'Stats saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      const retryAfter = error.response?.data?.retryAfterSeconds;
      toast({
        title: error.response?.status === 429 ? 'Rate limit' : 'Failed to save',
        description: error.response?.data?.message || 'Something went wrong',
        status: error.response?.status === 429 ? 'warning' : 'error',
        duration: retryAfter ? retryAfter * 1000 : 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStatsEntry(id);
      const nextPage =
        entries.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await loadEntries(nextPage);
      await loadSummary();
      await refreshRank();
      toast({
        title: 'Entry removed',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return;
    loadEntries(page);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Dashboard</Heading>
        <Box p={6} bg="white" borderRadius={8} boxShadow="md">
          <FormControl>
            <FormLabel>Paste stats summary and press Enter</FormLabel>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Processed 25/25 - Normal 0 - Under hour 0 - Cancelled 0 - Skipped 0 - Failed 0"
              isDisabled={saving}
            />
          </FormControl>
          <Text mt={2} fontSize="sm" color="gray.500">
            Today&apos;s stats reset each day. Past days are saved automatically at midnight.
          </Text>
          <Button
            mt={3}
            colorScheme="blue"
            onClick={handleAdd}
            isLoading={saving}
            loadingText="Saving..."
          >
            Add Stats
          </Button>
        </Box>

        {summary?.today && (
          <Box p={6} bg="white" borderRadius={8} boxShadow="md">
            <Heading size="md" mb={1}>Today&apos;s Stats</Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              {summary.today.date} · {summary.today.entryCount} entries · resets tomorrow
            </Text>
            {summary.today.entryCount > 0 ? (
              <StatsDisplay stats={summary.today} />
            ) : (
              <Text color="gray.500">Start at 0 — add your first entry for today.</Text>
            )}
          </Box>
        )}

        <Box p={6} bg="white" borderRadius={8} boxShadow="md">
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Today&apos;s History</Heading>
            {pagination.totalEntries > 0 && (
              <Text fontSize="sm" color="gray.500">
                Page {pagination.page} of {pagination.totalPages}
              </Text>
            )}
          </HStack>

          {loading ? (
            <Text color="gray.500">Loading...</Text>
          ) : entries.length === 0 ? (
            <Text color="gray.500">No entries for today yet.</Text>
          ) : (
            <>
              <Box
                maxH="420px"
                overflowY="auto"
                pr={2}
                css={{
                  '&::-webkit-scrollbar': { width: '8px' },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                  },
                }}
              >
                <VStack spacing={4} align="stretch">
                  {entries.map((entry) => (
                    <Box
                      key={entry._id}
                      p={4}
                      borderWidth={1}
                      borderRadius={8}
                      borderColor="gray.200"
                    >
                      <HStack justify="space-between" mb={3} align="flex-start">
                        <Text fontSize="sm" color="gray.600" flex={1}>
                          {entry.rawText}
                        </Text>
                        <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">
                          {new Date(entry.createdAt).toLocaleString()}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(entry._id)}
                        >
                          Delete
                        </Button>
                      </HStack>
                      <Divider mb={3} />
                      <StatsDisplay stats={entry} compact />
                    </Box>
                  ))}
                </VStack>
              </Box>

              {pagination.totalPages > 1 && (
                <HStack mt={4} spacing={2} justify="center" flexWrap="wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(pagination.page - 1)}
                    isDisabled={pagination.page <= 1 || loading}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === pagination.page ? 'solid' : 'outline'}
                      colorScheme="blue"
                      onClick={() => goToPage(page)}
                      isDisabled={loading}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => goToPage(pagination.page + 1)}
                    isDisabled={pagination.page >= pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </HStack>
              )}
            </>
          )}
        </Box>

        <Box p={6} bg="white" borderRadius={8} boxShadow="md">
          <Heading size="md" mb={1}>Recent Dates</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Final stats saved when each day ends.
          </Text>

          {summary?.dailySnapshots?.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {summary.dailySnapshots.map((day) => (
                <Box key={day._id} p={4} borderWidth={1} borderRadius={8} borderColor="gray.200">
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold">{day.date}</Text>
                    <Text fontSize="xs" color="gray.400">
                      {day.entryCount} entries · finalized {new Date(day.finalizedAt).toLocaleString()}
                    </Text>
                  </HStack>
                  <StatsDisplay stats={day} compact />
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No past days saved yet.</Text>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

const StatsDisplay = ({ stats, compact = false }) => {
  const processed = stats.processed;

  return (
    <>
      {processed && (
        <Box mb={compact ? 3 : 6} p={4} bg="blue.50" borderRadius={8}>
          <Stat>
            <StatLabel>Processed</StatLabel>
            <StatNumber>
              {processed.completed} / {processed.total}
            </StatNumber>
          </Stat>
        </Box>
      )}

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        {stats.normal !== undefined && (
          <StatCard label="Normal" value={stats.normal} color={statColors.normal} />
        )}
        {stats.underHour !== undefined && (
          <StatCard label="Under Hour" value={stats.underHour} color={statColors.underHour} />
        )}
        {stats.cancelled !== undefined && (
          <StatCard label="Cancelled" value={stats.cancelled} color={statColors.cancelled} />
        )}
        {stats.skipped !== undefined && (
          <StatCard label="Skipped" value={stats.skipped} color={statColors.skipped} />
        )}
        {stats.failed !== undefined && (
          <StatCard label="Failed" value={stats.failed} color={statColors.failed} />
        )}
      </SimpleGrid>
    </>
  );
};

const StatCard = ({ label, value, color }) => (
  <Box p={4} borderWidth={1} borderRadius={8} borderColor="gray.200">
    <Stat>
      <StatLabel>{label}</StatLabel>
      <StatNumber color={color}>{value}</StatNumber>
    </Stat>
  </Box>
);

export default Dashboard;
