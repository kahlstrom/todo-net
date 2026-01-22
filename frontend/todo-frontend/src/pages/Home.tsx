import React from "react";
import { Header } from "../components/Header";
import { TaskList } from "../components/TaskList";

/**
 * Home page / Dashboard with task management.
 */
const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text">
              Your Tasks
            </h1>
            <p className="text-muted-foreground mt-2">
              Stay organized and get things done
            </p>
          </div>

          {/* Task List */}
          <TaskList />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-sm text-muted-foreground">
        <p>Built with .NET Core & React • TodoNet</p>
      </footer>
    </div>
  );
};

export default Home;
