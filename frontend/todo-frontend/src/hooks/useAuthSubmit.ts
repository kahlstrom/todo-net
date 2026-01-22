import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFormData } from "../components/AuthForm";
import { LoginRequest, RegisterRequest } from "../services/types";

/**
 * Auth method type - function that takes login or register data and returns error message or null.
 */
type AuthMethod = ((data: LoginRequest) => Promise<string | null>) | ((data: RegisterRequest) => Promise<string | null>);

interface UseAuthSubmitOptions {
  /** The auth method to call (login or register) */
  authMethod: AuthMethod;
  /** Path to redirect to on success */
  redirectPath: string;
  /** Whether this is a registration form (includes confirmPassword) */
  isRegister?: boolean;
}

interface UseAuthSubmitReturn {
  /** Current error message, null if no error */
  error: string | null;
  /** Whether submission is in progress */
  isLoading: boolean;
  /** Submit handler for the auth form */
  handleSubmit: (data: AuthFormData) => Promise<void>;
}

/**
 * Custom hook for handling auth form submission.
 * Encapsulates loading state, error handling, and navigation.
 *
 * @param options - Configuration options
 * @returns Error state, loading state, and submit handler
 *
 * @example
 * ```tsx
 * const { error, isLoading, handleSubmit } = useAuthSubmit({
 *   authMethod: login,
 *   redirectPath: from,
 * });
 * ```
 */
export function useAuthSubmit({
  authMethod,
  redirectPath,
  isRegister = false,
}: UseAuthSubmitOptions): UseAuthSubmitReturn {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: AuthFormData) => {
      setError(null);
      setIsLoading(true);

      try {
        let errorMessage: string | null;

        if (isRegister) {
          const registerData: RegisterRequest = {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword || "",
          };
          errorMessage = await (authMethod as (data: RegisterRequest) => Promise<string | null>)(registerData);
        } else {
          const loginData: LoginRequest = {
            email: data.email,
            password: data.password,
          };
          errorMessage = await (authMethod as (data: LoginRequest) => Promise<string | null>)(loginData);
        }

        if (errorMessage) {
          setError(errorMessage);
        } else {
          // Successful auth - redirect
          navigate(redirectPath, { replace: true });
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [authMethod, redirectPath, isRegister, navigate]
  );

  return { error, isLoading, handleSubmit };
}
