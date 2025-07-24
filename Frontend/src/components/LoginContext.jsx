import { createContext } from 'react';

export const LoginContext = createContext({
    showLogin: false,
    setShowLogin: () => {},
    handleLoginSuccess: () => {},
});
