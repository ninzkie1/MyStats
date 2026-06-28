import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  Spacer,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatsRankProvider } from './context/StatsRankContext';
import Login from './components/Login';
import Register from './components/Register';


import ChangePassword from './components/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LogoutButton from './components/LogoutButton';
import RankMedals from './components/RankMedals';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';

const AuthHeader = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navButton = (path, label) => (
    <Button
      variant={location.pathname === path ? 'solid' : 'ghost'}
      colorScheme="blue"
      onClick={() => navigate(path)}
    >
      {label}
    </Button>
  );

  const displayName = user?.username || user?.data?.username || user?.email || 'User';

  return (
    <Flex p={4} bg="white" shadow="sm" gap={2} align="center">
      {navButton('/dashboard', 'Dashboard')}
      {navButton('/leaderboard', 'Leaderboard')}
      <Spacer />
      <Text fontSize="sm" color="gray.500">
        Hi, {displayName} 👋
      </Text>
      <RankMedals />
      <Menu>
        <MenuButton
          as={Button}
          aria-label="Account options"
          variant="outline"
          colorScheme="blue"
        >
          ▾
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => navigate('/change-password')}>
            Change Password
          </MenuItem>
          <LogoutButton asMenuItem />
        </MenuList>
      </Menu>
    </Flex>
  );
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <StatsRankProvider>
          <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
            <Router>
              <AuthHeader />
              <Box flex="1">
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/change-password"
                    element={
                      <ProtectedRoute>
                        <ChangePassword />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <Leaderboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <Navigate to="/dashboard" replace />
                    }
                  />
                </Routes>
              </Box>
              <Box as="footer" py={4} textAlign="center" color="gray.500" fontSize="sm">
                © 2026 Nino Rey. All rights reserved.
              </Box>
            </Router>
          </Box>
        </StatsRankProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
