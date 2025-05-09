"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

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

// Submenu component
function Submenu({ item, scrolled }: { item: NavItem; scrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleItemClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={cn(
          "flex items-center font-medium px-4 py-1.5 rounded-md transition-colors w-full justify-between",
          isOpen
            ? "text-emerald-600 bg-white/90" 
            : scrolled
              ? "text-gray-800 hover:text-emerald-700 hover:bg-white/80"
              : "text-gray-800 hover:text-emerald-700 hover:bg-white/30"
        )}
        aria-expanded={isOpen}
        onClick={() => handleItemClick(item.href)}
      >
        {item.title}
        <ChevronDown className={cn("ml-1 w-4 h-4 transition-transform duration-150", isOpen ? "rotate-180" : "")} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-sm rounded-lg py-2 mt-1 z-50 shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {item.subItems?.map((subItem) => (
            <button
              key={subItem.title}
              className="block w-full text-left px-4 py-1.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors rounded-md mx-1"
              onClick={() => handleItemClick(subItem.href)}
            >
              {subItem.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// NavLink component
function NavLink({ item, scrolled, isLoginPage }: { item: NavItem; scrolled: boolean; isLoginPage: boolean }) {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoginPage) return;
    e.preventDefault();
    
    if (item.href.startsWith('#')) {
      const element = document.getElementById(item.href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      router.push(item.href);
    }
  };

  return (
    <Link
      href={isLoginPage ? `/${item.href}` : item.href}
      className={cn(
        "flex items-center font-medium px-4 py-1.5 rounded-md transition-colors",
        scrolled
          ? "text-gray-800 hover:text-emerald-700 hover:bg-white/90"
          : "text-gray-800 hover:text-emerald-700 hover:bg-white/30"
      )}
      onClick={handleClick}
    >
      {item.title}
    </Link>
  );
}

// MobileNavItem component
function MobileNavItem({ item, onItemClick }: { item: NavItem; onItemClick: (href: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!item.submenu) {
    return (
      <li>
        <button
          onClick={() => onItemClick(item.href)}
          className="flex items-center w-full px-4 py-1.5 text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium"
        >
          {item.title}
        </button>
      </li>
    );
  }
  
  return (
    <li>
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-1.5 rounded-md font-medium",
            isOpen ? "text-emerald-600 bg-emerald-50" : "text-gray-800"
          )}
          aria-expanded={isOpen}
        >
          {item.title}
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-150", isOpen ? "rotate-180" : "")} />
        </button>
        
        {isOpen && (
          <div className="pl-4 mt-1 space-y-1 border-l-2 border-emerald-100 ml-3 animate-in slide-in-from-top-1 duration-150">
            {item.subItems?.map((subItem) => (
              <button
                key={subItem.title}
                className="block w-full text-left px-4 py-1.5 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                onClick={() => onItemClick(subItem.href)}
              >
                {subItem.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

// MobileMenu component
function MobileMenu({ isOpen, onLinkClick, isLoginPage }: { 
  isOpen: boolean; 
  onLinkClick: (href: string) => void;
  isLoginPage: boolean;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden bg-white/95 backdrop-blur-md absolute inset-x-0 top-full mt-2 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <MobileNavItem key={item.title} item={item} onItemClick={onLinkClick} />
          ))}
        </ul>
        {!isLoginPage && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link
              href="/login"
              className="flex items-center font-medium transition-all px-4 py-1.5 rounded-md justify-center w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => onLinkClick("/login")}
            >
              <Sparkles className="w-4 h-4 mr-1.5 opacity-80" />
              <span>Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Header component
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const isLoginPage = pathname === '/login';
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as Element).closest('nav')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);
  
  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);
  
  // Handle navigation
  const handleNavigation = useCallback((href: string) => {
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
  }, [isLoginPage, router]);
  
  return (
    <div className="w-full flex justify-center fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <nav
        className={cn(
          "relative w-full max-w-5xl transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm rounded-xl py-1.5" : "bg-transparent py-2"
        )}
      >
        <div className="px-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center z-10 relative" 
            aria-label="Potatix homepage"
          >
            <Image 
              src="/potatix-logo.svg" 
              alt="Potatix Logo" 
              width={120} 
              height={32} 
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <ul className="flex items-center space-x-4">
              {navItems.map((item) => (
                <li key={item.title} className="relative">
                  {item.submenu ? 
                    <Submenu item={item} scrolled={scrolled} /> : 
                    <NavLink item={item} scrolled={scrolled} isLoginPage={isLoginPage} />
                  }
                </li>
              ))}
            </ul>
            {!isLoginPage && (
              <div className="ml-4">
                <Link
                  href="/login"
                  className={cn(
                    "flex items-center font-medium transition-all px-4 py-1.5 rounded-md group",
                    scrolled
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md"
                      : "bg-white/30 text-gray-800 hover:bg-white/50"
                  )}
                  aria-label="Login to your account"
                >
                  <Sparkles className={cn("w-4 h-4 mr-1.5", scrolled ? "opacity-80" : "opacity-60")} />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "md:hidden flex items-center justify-center px-4 py-1.5 transition-colors z-50 rounded-md",
              scrolled ? "bg-white/70 hover:bg-white/90 text-gray-800" : "bg-white/20 hover:bg-white/40 text-gray-800"
            )}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu isOpen={isMenuOpen} onLinkClick={handleNavigation} isLoginPage={isLoginPage} />
      </nav>
    </div>
  );
} 