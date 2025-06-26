"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, BookOpen } from "lucide-react";

interface SocialLink {
  href: string;
  icon: React.ElementType;
  label: string;
}

// interface FooterLink {
//   href: string;
//   label: string;
// }

const SOCIAL_LINKS: SocialLink[] = [
  { href: "mailto:au@potatix.com", icon: Mail, label: "Email" }
];

// const PRODUCT_LINKS: FooterLink[] = [
//   { href: "#features", label: "Features" },
//   { href: "#pricing", label: "Pricing" },
//   { href: "#faq", label: "FAQs" },
//   { href: "/blog", label: "Blog" }
// ];

// const COMPANY_LINKS: FooterLink[] = [
//   { href: "/about", label: "About" },
//   { href: "/privacy", label: "Privacy" },
//   { href: "/terms", label: "Terms" },
//   { href: "/contact", label: "Contact" }
// ];

function SocialIcons({ links }: { links: SocialLink[] }) {
  return (
    <div className="flex gap-4">
      {links.map(({ href, icon: Icon, label }) => (
        <Link 
          key={label}
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-emerald-500 transition-colors"
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </Link>
      ))}
    </div>
  );
}

// function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
//   return (
//     <div>
//       <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
//       <ul className="space-y-2">
//         {links.map(({ href, label }) => (
//           <li key={label}>
//             <Link 
//               href={href} 
//               className="text-sm text-slate-400 hover:text-emerald-400 transition-colors inline-block"
//             >
//               {label}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

function CompanyInfo() {
  return (
    <div className="space-y-4">
      <Link href="/" className="inline-block">
        <Image 
          src="https://storage.potatix.com/potatix/images/potatix-logo-white.svg" 
          alt="Potatix Logo" 
          width={120} 
          height={32} 
          className="h-8 w-auto"
        />
      </Link>
      <p className="text-sm text-slate-400 max-w-xs">
        A minimalist platform for creators to sell courses without the bloat. 100% free, no fees or revenue share. 2025, All rights reserved.
      </p>
      <SocialIcons links={SOCIAL_LINKS} />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <CompanyInfo />
          </div>
          {/* <LinkColumn title="Product" links={PRODUCT_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} /> */}
        </div>
        
        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center">
          
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Built for course creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
} 