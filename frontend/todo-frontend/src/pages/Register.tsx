import React from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { AuthForm } from "../components/AuthForm";

/**
 * Registration page with authentication form.
 * Redirects to home after successful registration.
 */
const Register: React.FC = () => {
  const { register } = useAuth();

  const { error, isLoading, handleSubmit } = useAuthSubmit({
    authMethod: register,
    redirectPath: "/",
    isRegister: true,
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <AuthForm
        mode="register"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Register;
