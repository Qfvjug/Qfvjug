import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is logged in
  const isLoggedIn = auth.isLoggedIn();

  // Handle scroll events to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle the mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the mobile menu when a link is clicked
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300", 
      isScrolled || isOpen 
        ? "bg-background border-b border-border"
        : "bg-background/90 backdrop-blur"
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="font-bold text-xl hidden sm:inline-block">Qfvjug</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className={cn(
                "text-foreground hover:text-primary font-medium transition-colors",
                location === "/" && "text-primary"
              )}>
                Home
              </a>
            </Link>
            <Link href="/videos">
              <a className={cn(
                "text-foreground hover:text-primary font-medium transition-colors",
                location === "/videos" && "text-primary"
              )}>
                Videos
              </a>
            </Link>
            <Link href="/downloads">
              <a className={cn(
                "text-foreground hover:text-primary font-medium transition-colors",
                location === "/downloads" && "text-primary"
              )}>
                Downloads
              </a>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <NotificationBell />

            {/* Login/Admin */}
            {isLoggedIn ? (
              <Link href="/admin">
                <Button className="hidden md:flex" size="sm">
                  Admin Panel
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="hidden md:flex" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "md:hidden",
        isOpen ? "block border-t border-border" : "hidden"
      )}>
        <div className="px-4 py-3 space-y-1">
          <Link href="/">
            <a 
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium hover:bg-muted",
                location === "/" && "bg-muted"
              )}
              onClick={closeMenu}
            >
              Home
            </a>
          </Link>
          <Link href="/videos">
            <a 
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium hover:bg-muted",
                location === "/videos" && "bg-muted"
              )}
              onClick={closeMenu}
            >
              Videos
            </a>
          </Link>
          <Link href="/downloads">
            <a 
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium hover:bg-muted",
                location === "/downloads" && "bg-muted"
              )}
              onClick={closeMenu}
            >
              Downloads
            </a>
          </Link>
          {isLoggedIn ? (
            <Link href="/admin">
              <a 
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-muted"
                onClick={closeMenu}
              >
                Admin Panel
              </a>
            </Link>
          ) : (
            <Link href="/login">
              <a 
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-muted"
                onClick={closeMenu}
              >
                Login
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
