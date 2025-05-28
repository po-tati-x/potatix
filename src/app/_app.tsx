'use client';

import { useEffect } from 'react';
import axios from 'axios';

// Global configuration for axios
axios.defaults.withCredentials = true;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 