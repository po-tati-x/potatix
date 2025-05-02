"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Mail, SendHorizonal, Twitter, Instagram, Linkedin, Github } from "lucide-react";

type SocialLink = {
  href: string;
  icon: React.ElementType;
  label: string;
};

type FooterLink = {
  href: string;
  label: string;
};

const socialLinks: SocialLink[] = [
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "https://github.com", icon: Github, label: "GitHub" }
];

const quickLinks: FooterLink[] = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQs" },
  { href: "/blog", label: "Blog" }
];

const companyLinks: FooterLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact Us" }
];

const legalLinks: FooterLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" }
];

const SocialIcons = ({ links }: { links: SocialLink[] }) => (
  <div className="flex gap-4">
    {links.map(({ href, icon: Icon, label }) => (
      <Link 
        key={label}
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-[#06A28B] transition-colors p-2 -m-2"
        aria-label={`Follow us on ${label}`}
      >
        <Icon className="h-4 w-4" />
      </Link>
    ))}
  </div>
);

const LinkColumn = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div className="space-y-3">
    <h3 className="text-base font-semibold text-white">{title}</h3>
    <ul className="space-y-2">
      {links.map(({ href, label }) => (
        <li key={label}>
          <Link 
            href={href} 
            className="text-sm text-gray-400 hover:text-[#06A28B] transition-colors inline-block py-1"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const CompanyInfo = () => (
  <div className="space-y-4">
    <Link href="/" className="inline-block">
      <Image 
        src="/potatix-logo-white.svg" 
        alt="Potatix Logo" 
        width={120} 
        height={32} 
        className="h-8 w-auto"
      />
    </Link>
    <p className="text-sm text-gray-400">
      Knowledge is the only wealth that increases when shared. We're creating a platform that transforms knowledge exchange into a catalyst for personal growth.
    </p>
    <SocialIcons links={socialLinks} />
  </div>
);

const Footer = () => {
  return (
    <footer className="text-white pt-10 sm:pt-12 pb-6">
      <div className="mx-auto px-6 sm:px-8 lg:px-10 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <CompanyInfo />
          <LinkColumn title="Quick Links" links={quickLinks} />
          <LinkColumn title="Company" links={companyLinks} />
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} Potatix. All rights reserved.
            </p>
            <div className="flex gap-4">
              {legalLinks.map(({ href, label }) => (
                <Link 
                  key={label}
                  href={href} 
                  className="text-xs text-gray-500 hover:text-[#06A28B] transition-colors py-1"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 