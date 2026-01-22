import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { AuthForm } from "../components/AuthForm";

/**
 * Login page with authentication form.
 * Redirects to the original destination after successful login.
 */
const Login: React.FC = () => {
  const location = useLocation();
  const { login } = useAuth();

  // Get the redirect destination (default to home)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const { error, isLoading, handleSubmit } = useAuthSubmit({
    authMethod: login,
    redirectPath: from,
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Login;
