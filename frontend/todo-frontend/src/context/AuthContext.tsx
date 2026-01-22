import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi } from "../services/api";
import { UserInfo, LoginRequest, RegisterRequest, AuthResponse } from "../services/types";
import { STORAGE_KEYS } from "../services/constants";

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<string | null>;
  register: (data: RegisterRequest) => Promise<string | null>;
  logout: () => void;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider.
 * Manages user authentication state and provides login/logout functions.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as UserInfo;
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Invalid stored data, clear it
          clearAuthStorage();
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  /**
   * Clears auth data from localStorage.
   */
  const clearAuthStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  /**
   * Handles successful authentication by storing credentials and updating state.
   */
  const handleAuthSuccess = (response: AuthResponse) => {
    const { token, user } = response;

    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Update state
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  /**
   * Logs in a user with email and password.
   * Returns null on success, error message on failure.
   */
  const login = useCallback(async (data: LoginRequest): Promise<string | null> => {
    const result = await authApi.login(data);

    if (result.error || !result.data) {
      return result.error || "Login failed";
    }

    handleAuthSuccess(result.data);
    return null;
  }, []);

  /**
   * Registers a new user account.
   * Returns null on success, error message on failure.
   */
  const register = useCallback(async (data: RegisterRequest): Promise<string | null> => {
    const result = await authApi.register(data);

    if (result.error || !result.data) {
      return result.error || "Registration failed";
    }

    handleAuthSuccess(result.data);
    return null;
  }, []);

  /**
   * Logs out the current user.
   */
  const logout = useCallback(() => {
    clearAuthStorage();

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the auth context.
 * Must be used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
