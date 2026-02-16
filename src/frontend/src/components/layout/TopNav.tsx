import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LoginButton from '@/components/auth/LoginButton';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    // After successful login, navigate to home
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/generated/trucktrack-africa-logo.dim_512x512.png" alt="TruckTrack Africa" className="h-10 w-10" />
            <span className="font-semibold text-lg">TruckTrack Africa</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about">About</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/services">Services</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/load-board">Load Board</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contracts">Contracts</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LoginButton onLoginSuccess={handleLoginSuccess} />
          {isAuthenticated && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/register/client">Register as Client</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/register/transporter">Register as Transporter</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/load-board" onClick={() => setMobileMenuOpen(false)}>Load Board</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/contracts" onClick={() => setMobileMenuOpen(false)}>Contracts</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </Button>
            <div className="pt-2 border-t mt-2">
              <LoginButton onLoginSuccess={handleLoginSuccess} />
              {isAuthenticated && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <Link to="/register/client" onClick={() => setMobileMenuOpen(false)}>Register as Client</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <Link to="/register/transporter" onClick={() => setMobileMenuOpen(false)}>Register as Transporter</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
