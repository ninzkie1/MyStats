import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Heading,
  Container,
} from '@chakra-ui/react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  getRememberedUsername,
  setRememberedUsername,
  clearRememberedUsername,
  getRememberMePreference,
  setRememberMePreference,
} from '../utils/authStorage';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const { login: authLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    setUsername(getRememberedUsername());
    setRememberMe(getRememberMePreference());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const data = await login({ username, password });
      authLogin(data, rememberMe);

      setRememberMePreference(rememberMe);
      if (rememberMe) {
        setRememberedUsername(username);
      } else {
        clearRememberedUsername();
      }

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Incorrect username or password.'
        : error.response?.data?.message || 'Something went wrong';

      setLoginError(message);

      toast({
        title: 'Login failed',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={4} align="stretch">
          <Heading textAlign="center" mb={6}>Login</Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              {loginError && (
                <Text color="red.500" fontSize="sm" textAlign="center">
                  {loginError}
                </Text>
              )}
              <Checkbox
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                colorScheme="blue"
              >
                Remember me
              </Checkbox>
              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Login
              </Button>
              <Text textAlign="center">
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/change-password')}
                >
                  Forgot password?
                </Button>
              </Text>
              <Text textAlign="center">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/register')}
                >
                  Register here
                </Button>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login;
