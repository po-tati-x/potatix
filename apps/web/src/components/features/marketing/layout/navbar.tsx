"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Sparkles, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/potatix/Button";
import { authClient } from "@/lib/auth/auth-client";

// Types
type NavItem = {
  title: string;
  href: string;
  submenu?: boolean;
  subItems?: NavItem[];
};

// Navigation data
const navItems: NavItem[] = [
  { title: "Features", href: "#features" },
  { title: "Pricing", href: "#pricing" },
  { title: "Testimonials", href: "#testimonials" },
  { title: "FAQ", href: "#faq" },
];

// Main Header component
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const isLoginPage = pathname === '/login';
  
  // Check auth status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await authClient.getSession();
        setIsLoggedIn(!!data);
      } catch {
        setIsLoggedIn(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const closeMenu = (e: MouseEvent) => {
      if (!(e.target as Element).closest('nav')) setIsMenuOpen(false);
    };
    
    document.addEventListener('mousedown', closeMenu);
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('keydown', handleEsc);
    
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMenuOpen]);
  
  // Handle navigation and smooth scrolling
  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    
    if (href.startsWith('#')) {
      if (isLoginPage) {
        router.push(`/${href}`);
        return;
      }
      
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const navbarHeight = 80;
        const targetPosition = targetSection.offsetTop - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    } else {
      router.push(href);
    }
  };
  
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <nav
        className={cn(
          "relative w-full max-w-5xl transition-all duration-300 rounded-md px-4",
          scrolled ? "bg-white/80 backdrop-blur-md border border-slate-200 py-1.5" : "bg-transparent py-2"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="relative z-10 flex items-center" 
            aria-label="Potatix homepage"
          >
            <Image 
              src="https://www.potatix.com/potatix-logo.svg" 
              alt="Potatix Logo" 
              width={120} 
              height={32} 
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavItem 
                key={item.title} 
                item={item} 
                scrolled={scrolled}
                onNavigate={handleNavigation}
              />
            ))}
            
            {!isLoginPage && (
              <Button
                type={scrolled ? "primary" : "text"}
                size="small"
                iconLeft={isLoggedIn ? <LayoutDashboard className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5 opacity-80" />}
                onClick={() => router.push(isLoggedIn ? "/dashboard" : "/login")}
                className={scrolled ? "" : "bg-white/30 hover:bg-white/50 text-slate-800"}
              >
                {isLoggedIn ? "Dashboard" : "Login"}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            type="text"
            size="small"
            className={cn(
              "md:hidden",
              scrolled 
                ? "bg-white/70 hover:bg-white/90" 
                : "bg-white/20 hover:bg-white/40"
            )}
            iconLeft={isMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-full mt-2 animate-in fade-in slide-in-from-top-2 duration-200 rounded-md bg-white/95 backdrop-blur-md border border-slate-200 overflow-hidden md:hidden">
            <div className="p-3 space-y-1">
              {navItems.map((item) => (
                <MobileNavItem 
                  key={item.title} 
                  item={item} 
                  onNavigate={handleNavigation} 
                />
              ))}
              
              {!isLoginPage && (
                <div className="border-t border-slate-100 mt-3 pt-3">
                  <Button
                    type="primary" 
                    size="small"
                    block
                    iconLeft={isLoggedIn ? <LayoutDashboard className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    onClick={() => handleNavigation(isLoggedIn ? "/dashboard" : "/login")}
                  >
                    {isLoggedIn ? "Dashboard" : "Login"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

// NavItem component
function NavItem({ 
  item, 
  scrolled, 
  onNavigate 
}: { 
  item: NavItem; 
  scrolled: boolean;
  onNavigate: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!item.submenu) {
    return (
      <Button
        type="text"
        size="small"
        onClick={() => onNavigate(item.href)}
        className={cn(
          scrolled
            ? "hover:bg-white/90 hover:text-emerald-700"
            : "bg-transparent hover:bg-white/30 hover:text-emerald-700"
        )}
      >
        {item.title}
      </Button>
    );
  }

  return (
    <div 
      className="relative" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button
        type="text"
        size="small"
        onClick={() => onNavigate(item.href)}
        className={cn(
          "justify-between",
          isOpen
            ? "bg-white/90 text-emerald-600" 
            : scrolled
              ? "hover:bg-white/80 hover:text-emerald-700"
              : "bg-transparent hover:bg-white/30 hover:text-emerald-700"
        )}
        iconRight={
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-150", 
              isOpen ? "rotate-180" : ""
            )} 
          />
        }
        aria-expanded={isOpen}
      >
        {item.title}
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 animate-in fade-in slide-in-from-top-1 duration-150 rounded-md border border-slate-200 bg-white/95 py-2 backdrop-blur-sm">
          {item.subItems?.map((subItem) => (
            <Button
              key={subItem.title}
              type="text"
              size="small"
              className="mx-1 w-[calc(100%-0.5rem)] justify-start hover:bg-slate-50 hover:text-emerald-700"
              onClick={() => {
                onNavigate(subItem.href);
                setIsOpen(false);
              }}
            >
              {subItem.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile nav item component
function MobileNavItem({ 
  item, 
  onNavigate 
}: { 
  item: NavItem; 
  onNavigate: (href: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!item.submenu) {
    return (
      <Button
        type="text"
        size="small"
        block
        onClick={() => onNavigate(item.href)}
        className="justify-start hover:bg-emerald-50 hover:text-emerald-700"
      >
        {item.title}
      </Button>
    );
  }
  
  return (
    <div className="w-full">
      <Button
        type={isOpen ? "text" : "text"}
        size="small"
        block
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "justify-between",
          isOpen ? "bg-emerald-50 text-emerald-600" : ""
        )}
        iconRight={
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-150", 
              isOpen ? "rotate-180" : ""
            )} 
          />
        }
        aria-expanded={isOpen}
      >
        {item.title}
      </Button>
      
      {isOpen && (
        <div className="ml-3 mt-1 animate-in slide-in-from-top-1 duration-150 space-y-1 border-l-2 border-emerald-100 pl-4">
          {item.subItems?.map((subItem) => (
            <Button
              key={subItem.title}
              type="text"
              size="small"
              block
              className="justify-start hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onNavigate(subItem.href)}
            >
              {subItem.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
} 