import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { CheckCircle2, LogOut, User } from "lucide-react";

/**
 * Application header with logo and user menu.
 */
export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">TodoNet</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email}</span>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
