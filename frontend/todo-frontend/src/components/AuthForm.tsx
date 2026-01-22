import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { CheckCircle2, Mail, Lock, Eye, EyeOff } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthFormData) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Reusable authentication form for login and registration.
 * Includes client-side validation and password visibility toggle.
 */
export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  error,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create an account";
  const description = isLogin
    ? "Sign in to manage your tasks"
    : "Get started with your free account";
  const submitText = isLogin ? "Sign In" : "Create Account";
  const switchText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const switchLink = isLogin ? "/register" : "/login";
  const switchLinkText = isLogin ? "Sign up" : "Sign in";

  /**
   * Validates form data and returns any errors.
   */
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation (register only)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit
    await onSubmit(formData);
  };

  /**
   * Updates form field value.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      <Card>
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="gradient-text">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-fade-in">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="pl-10"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                className="pl-10 pr-10"
                autoComplete={isLogin ? "current-password" : "new-password"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Confirm password field (register only) */}
            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="pl-10"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {submitText}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {switchText}{" "}
            <Link
              to={switchLink}
              className="text-primary hover:underline font-medium"
            >
              {switchLinkText}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
