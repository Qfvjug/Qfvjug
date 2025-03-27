import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "@/pages/not-found";

// Lazy-loaded pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const VideosPage = lazy(() => import("@/pages/VideosPage"));
const DownloadsPage = lazy(() => import("@/pages/DownloadsPage"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const Login = lazy(() => import("@/pages/Login"));

// Loading component for suspense fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/videos" component={VideosPage} />
        <Route path="/downloads" component={DownloadsPage} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/login" component={Login} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
