"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// Define consistent sizes and spacings
const NAV_PADDING = "px-4 py-1.5";
const NAV_ROUNDED = "rounded-md";
const ICON_SIZE = "w-4 h-4";
const CONSISTENT_SPACING = "space-x-4";
const PRIMARY_COLOR = "text-emerald-600";
const PRIMARY_HOVER = "hover:text-emerald-700";
const PRIMARY_BG = "bg-emerald-600";
const PRIMARY_BG_HOVER = "hover:bg-emerald-700";

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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const isWaitlistPage = pathname === '/waitlist';
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveSubmenu(null);
        setIsMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSubmenu(null);
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  
  const handleNavLinkClick = (href: string) => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
    
    if (href.startsWith('#')) {
      if (isWaitlistPage) {
        window.location.href = `/${href}`;
        return;
      }
      
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const navbarHeight = window.innerWidth >= 768 ? 80 : 64;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;
        
        setTimeout(() => {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }, 150);
      }
    } else {
      window.location.href = href;
    }
  };

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={isWaitlistPage ? `/${item.href}` : item.href}
      className={cn(
        "flex items-center font-medium px-4 py-1.5 rounded-md transition-colors",
        scrolled
          ? "text-gray-800 hover:text-emerald-700 hover:bg-white/90"
          : "text-gray-800 hover:text-emerald-700 hover:bg-white/30"
      )}
      onClick={(e) => {
        if (isWaitlistPage) return;
        e.preventDefault();
        handleNavLinkClick(item.href);
      }}
    >
      {item.title}
    </Link>
  );

  const SubmenuButton = ({ item }: { item: NavItem }) => (
    <div 
      className="relative"
      onMouseEnter={() => setActiveSubmenu(item.title)}
      onMouseLeave={() => setActiveSubmenu(null)}
    >
      <button
        onClick={() => handleNavLinkClick(item.href)}
        className={cn(
          "flex items-center font-medium px-4 py-1.5 rounded-md transition-colors w-full justify-between",
          (activeSubmenu === item.title)
            ? "text-emerald-600 bg-white/90" 
            : scrolled
              ? "text-gray-800 hover:text-emerald-700 hover:bg-white/80"
              : "text-gray-800 hover:text-emerald-700 hover:bg-white/30"
        )}
        aria-expanded={activeSubmenu === item.title}
      >
        {item.title}
        <ChevronDown
          className={cn(
            "ml-1 w-4 h-4 transition-transform duration-150",
            (activeSubmenu === item.title) ? "rotate-180" : ""
          )}
        />
      </button>
      <AnimatePresence>
        {activeSubmenu === item.title && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 w-56 bg-white/95 backdrop-blur-sm rounded-lg py-2 mt-1 z-50 shadow-lg border border-gray-100"
          >
            {item.subItems?.map((subItem) => (
              <Link
                key={subItem.title}
                href={subItem.href}
                className="block px-4 py-1.5 text-gray-700 hover:text-emerald-700 hover:bg-gray-50 transition-colors rounded-md mx-1"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavLinkClick(subItem.href);
                }}
                role="menuitem"
              >
                {subItem.title}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const MobileNavItem = ({ item }: { item: NavItem }) => (
    <li>
      {item.submenu ? (
        <div className="w-full">
          <button
            onClick={() => setActiveSubmenu(activeSubmenu === item.title ? null : item.title)}
            className={cn(
              "flex items-center justify-between w-full px-4 py-1.5 rounded-md font-medium",
              activeSubmenu === item.title ? "text-emerald-600 bg-emerald-50" : "text-gray-800"
            )}
            aria-expanded={activeSubmenu === item.title}
          >
            {item.title}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-150",
                activeSubmenu === item.title ? "rotate-180" : ""
              )}
            />
          </button>
          <AnimatePresence>
            {activeSubmenu === item.title && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="pl-4 mt-1 space-y-1 border-l-2 border-emerald-100 ml-3"
              >
                {item.subItems?.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.href}
                    className="block px-4 py-1.5 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    onClick={() => handleNavLinkClick(subItem.href)}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          onClick={() => handleNavLinkClick(item.href)}
          className="flex items-center w-full px-4 py-1.5 text-gray-800 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium"
        >
          {item.title}
        </button>
      )}
    </li>
  );

  return (
    <div className="w-full flex justify-center fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <motion.nav
        ref={navRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
                  {item.submenu ? <SubmenuButton item={item} /> : <NavLink item={item} />}
                </li>
              ))}
            </ul>
            {!isWaitlistPage && (
              <div className="ml-4">
                <Link
                  href="/waitlist"
                  className={cn(
                    "flex items-center font-medium transition-all px-4 py-1.5 rounded-md group",
                    scrolled
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md"
                      : "bg-white/30 text-gray-800 hover:bg-white/50"
                  )}
                  aria-label="Join the waitlist"
                >
                  <Sparkles className={cn("w-4 h-4 mr-1.5", scrolled ? "opacity-80" : "opacity-60")} />
                  <span>Join Waitlist</span>
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
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white/95 backdrop-blur-md absolute inset-x-0 top-full mt-2 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-3">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <MobileNavItem key={item.title} item={item} />
                  ))}
                </ul>
                {!isWaitlistPage && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link
                      href="/waitlist"
                      className="flex items-center font-medium transition-all px-4 py-1.5 rounded-md justify-center w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Join the waitlist"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5 opacity-80" />
                      <span>Join Waitlist</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Header; 