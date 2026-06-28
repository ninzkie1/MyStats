import { Button, MenuItem, useToast } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const LogoutButton = ({ asMenuItem = false }) => {
  const { logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (asMenuItem) {
    return <MenuItem onClick={handleLogout}>Logout</MenuItem>;
  }

  return (
    <Button
      colorScheme="blue"
      variant="outline"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
