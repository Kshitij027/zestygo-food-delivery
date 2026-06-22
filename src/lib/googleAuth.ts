// Google Auth initialization
import { googleLogout } from '@react-oauth/google';

export const handleLogout = () => {
  googleLogout();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// No specialized lib needed for simple token exchange, 
// as @react-oauth/google handles most of it via hooks.
