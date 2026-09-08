import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, token, wallet } = useSelector((state) => state.auth);
  return { user, token, wallet, isAuthenticated: !!token, isAdmin: user?.role === 'admin' };
};
