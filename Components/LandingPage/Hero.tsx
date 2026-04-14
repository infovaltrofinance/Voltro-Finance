"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Shield,
  Lock,
  Globe,
  Wallet,
  ArrowRight,
  CheckCircle,
  Building,
  Leaf,
  Users,
  TrendingUp,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  ExternalLink,
  X,
  Menu,
  Star,
  Award,
  Sparkles,
  Cookie,
  Info
} from "lucide-react";

// TypeScript interface for feature props
interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Feature card component with gold/dark theme
const FeatureCard: React.FC<FeatureProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 group">
      <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37] mb-5 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#0B1221] mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

// Trust badge component for regulatory claims
const TrustBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
    <span className="text-sm">{children}</span>
  </div>
);

// Navigation item type
interface NavItem {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
}

const navigationItems: NavItem[] = [
  { 
    label: "Personal", 
    href: "#products",
    dropdown: [
      { label: "Savings Accounts", href: "#rates" },
      { label: "Term Deposits", href: "#rates" },
      { label: "Everyday Banking", href: "#rates" },
    ]
  },
  { label: "Rates", href: "#rates" },
  {
    label: "About",
    href: "#about",
    dropdown: [
      { label: "Our Story", href: "#about" },
      { label: "Leadership", href: "#about" },
    ],
  },
  {
    label: "Corporate",
    href: "#institutions",
    dropdown: [
      { label: "Business Solutions", href: "#institutions" },
      { label: "Sustainability", href: "#sustainability" },
      { label: "Investor Relations", href: "#investors" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    label: "Help",
    href: "#support",
    dropdown: [
      { label: "Support Centre", href: "#support" },
      { label: "Security", href: "#security" },
    ],
  },
];

export default function LandingPage() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showOpenAccountForm, setShowOpenAccountForm] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [openAccountForm, setOpenAccountForm] = useState({ name: '', email: '', password: '', accountType: 'Savings' });
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [videoUnmuted, setVideoUnmuted] = useState(false);
  const router = useRouter();

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for cookie consent on mount
  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookies_accepted');
    if (!hasAccepted) {
      const timer = setTimeout(() => setShowCookieConsent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      // Optionally verify token validity or redirect
      console.log('User already has a session');
    }
  }, []);

  // Global interaction listener to unmute video
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!videoUnmuted) {
        const iframe = document.getElementById('hero-video') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setVideoUnmuted(true);
        }
      }
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [videoUnmuted]);

  // Smooth scroll to section
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(null);
    setIsLoading(true);
    
    if (!loginEmail || !loginPassword) {
      setLoginMessage({ type: 'error', text: 'Please enter both email and password' });
      setIsLoading(false);
      return;
    }

    try {
      // Correct endpoint - using the full path as defined in your API setup
      const response = await api.post('v1/accounts/login/', {
        email: loginEmail,
        password: loginPassword,
      });

      const { message, tokens, account } = response.data;

      // Validate response structure
      if (!tokens || !tokens.access || !tokens.refresh) {
        throw new Error('Invalid response from server');
      }

      // Save session data to localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_account', JSON.stringify(account));
      
      // Also store user email for convenience
      localStorage.setItem('user_email', loginEmail);

      setLoginMessage({ type: 'success', text: message + ' Redirecting to dashboard...' });
      
      // Clear form fields
      setLoginEmail("");
      setLoginPassword("");
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error("Login attempt failed:", error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          setLoginMessage({ type: 'error', text: 'Invalid email or password. Please try again.' });
        } else if (status === 400) {
          setLoginMessage({ type: 'error', text: errorData.message || errorData.detail || 'Please check your input and try again.' });
        } else if (status === 500) {
          setLoginMessage({ type: 'error', text: 'Server error. Please try again later.' });
        } else {
          setLoginMessage({ type: 'error', text: errorData?.message || errorData?.detail || 'Login failed. Please try again.' });
        }
      } else if (error.request) {
        // Request was made but no response received
        setLoginMessage({ type: 'error', text: 'Cannot connect to server. Please check your internet connection.' });
      } else {
        // Something else happened
        setLoginMessage({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Open Account submission
  const handleOpenAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Registration successful! Please login to continue.");
      setShowOpenAccountForm(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('#hero')}>
              <img src="/logo_no_bg.png" alt="Valtro Logo" className="h-10 lg:h-12 w-auto object-contain" />
              <span className="font-bold text-[#0B1221] text-lg lg:text-xl hidden lg:block tracking-tight">
                Valtro Trust Finance
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                <div 
                  key={item.label} 
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => scrollToSection(item.href)}
                    className="text-gray-600 hover:text-[#D4AF37] transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    {item.label}
                    {item.dropdown && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.dropdown && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 transition-all duration-200 z-50">
                      {item.dropdown.map((drop) => (
                        <button
                          key={drop.label}
                          onClick={() => scrollToSection(drop.href)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#D4AF37] first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {drop.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowLoginForm(true)}
                className="text-gray-600 hover:text-[#D4AF37] font-semibold text-sm px-3 lg:px-4 py-2 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowOpenAccountForm(true)}
                className="hidden lg:block bg-[#0B1221] hover:bg-black text-white rounded-full px-6 py-2 text-sm font-semibold shadow-md transition-all"
              >
                Open Account
              </button>

              {/* Mobile Menu Toggle Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            
            {/* Video Container (Top on Mobile, Right on Desktop) */}
            <div className="order-1 md:order-2 relative flex justify-center animate-in fade-in zoom-in duration-700">
              <div className="w-full aspect-video md:aspect-square max-w-xl bg-black rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border-4 border-[#D4AF37]/30">
                <iframe 
                  id="hero-video"
                  src="https://www.youtube.com/embed/_BBrR6Zhi3M?autoplay=1&mute=1&controls=0&loop=1&playlist=_BBrR6Zhi3M&rel=0&showinfo=0&enablejsapi=1&playsinline=1" 
                  title="Valtro Finance Presentation"
                  className="absolute inset-0 w-full h-full scale-110 pointer-events-none"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                
                {!videoUnmuted && (
                  <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Tap for sound</span>
                  </div>
                )}
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
            </div>

            {/* Text Content (Bottom on Mobile, Left on Desktop) */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-6">
                <Shield className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
                <span className="text-xs font-medium text-[#D4AF37]">
                  Government Protected
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1221] leading-tight px-2 md:px-0">
                Banking for the Bold.{" "}
                <span className="text-[#D4AF37]">Secured for the Future.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Experience institutional-grade security with personal service.
                Open an account in minutes and join thousands of Australians who
                trust us with their financial future.
              </p>

              {/* Trust badges row */}
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                <TrustBadge>FCS Protection up to $250K</TrustBadge>
                <TrustBadge>AI-Powered Security</TrustBadge>
                <TrustBadge>24/7 Local Support</TrustBadge>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4 px-6 md:px-0">
                <button
                  onClick={() => setShowOpenAccountForm(true)}
                  className="bg-[#D4AF37] hover:bg-[#f5cc45] text-[#0B1221] font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Open Account <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollToSection('#rates')}
                  className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-full shadow-sm transition-all duration-200"
                >
                  Compare Rates
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Trust Section - 3 Column Grid */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-medium text-[#D4AF37]">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
              Bank with absolute confidence
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with uncompromising security to
              protect what matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              title="Military-Grade Security"
              description="256-bit encryption, multi-factor authentication, and real-time fraud monitoring keep your funds safe 24/7."
              icon={<Shield className="w-6 h-6" aria-hidden="true" />}
            />
            <FeatureCard
              title="FCS Protection"
              description="Deposits are government-protected up to $250,000 per account holder under the Financial Claims Scheme."
              icon={<Lock className="w-6 h-6" aria-hidden="true" />}
            />
            <FeatureCard
              title="Local Australian Support"
              description="Sydney-based customer service team available 7 days a week. Real people, real help, no chatbots."
              icon={<Globe className="w-6 h-6" aria-hidden="true" />}
            />
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-12 bg-gradient-to-r from-[#D4AF37]/5 to-gray-50 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 border border-[#D4AF37]/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span className="text-sm text-gray-600">APRA Regulated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span className="text-sm text-gray-600">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span className="text-sm text-gray-600">PCI DSS Level 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
              <span className="text-sm text-gray-600">5-Star Rated</span>
            </div>
          </div>
        </section>

        {/* Rates Section */}
        <section id="rates" className="py-16 md:py-20 bg-gradient-to-br from-[#0B1221] to-[#1a2538] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 rounded-full px-4 py-1.5 mb-4">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium text-[#D4AF37]">Competitive Rates</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                High-interest accounts that work for you
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Earn more with our market-leading savings rates. No hidden fees, no minimum balance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-[#D4AF37]/50 transition-all">
                <h3 className="text-xl font-bold mb-2">Savings Account</h3>
                <p className="text-4xl font-bold text-[#D4AF37] mt-4">5.35%</p>
                <p className="text-sm text-gray-300 mb-6">p.a. variable rate</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">✓ No account fees</li>
                  <li className="flex items-center gap-2">✓ Instant access</li>
                  <li className="flex items-center gap-2">✓ Interest calculated daily</li>
                </ul>
                <button 
                  onClick={() => { setOpenAccountForm({...openAccountForm, accountType: 'Savings'}); setShowOpenAccountForm(true); }}
                  className="w-full mt-8 bg-[#D4AF37] text-[#0B1221] font-semibold py-3 rounded-xl hover:bg-[#f5cc45] transition"
                >
                  Open Account
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-[#D4AF37]/50 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-[#0B1221] text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Term Deposit</h3>
                <p className="text-4xl font-bold text-[#D4AF37] mt-4">5.50%</p>
                <p className="text-sm text-gray-300 mb-6">p.a. fixed for 12 months</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">✓ Fixed returns guaranteed</li>
                  <li className="flex items-center gap-2">✓ Government protected</li>
                  <li className="flex items-center gap-2">✓ Flexible terms available</li>
                </ul>
                <button 
                  onClick={() => { setOpenAccountForm({...openAccountForm, accountType: 'Term Deposit'}); setShowOpenAccountForm(true); }}
                  className="w-full mt-8 bg-[#D4AF37] text-[#0B1221] font-semibold py-3 rounded-xl hover:bg-[#f5cc45] transition"
                >
                  Open Account
                </button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-[#D4AF37]/50 transition-all">
                <h3 className="text-xl font-bold mb-2">Everyday Account</h3>
                <p className="text-4xl font-bold text-[#D4AF37] mt-4">0%</p>
                <p className="text-sm text-gray-300 mb-6">monthly fees</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">✓ Free transactions</li>
                  <li className="flex items-center gap-2">✓ Apple Pay & Google Pay</li>
                  <li className="flex items-center gap-2">✓ 24/7 customer support</li>
                </ul>
                <button 
                  onClick={() => { setOpenAccountForm({...openAccountForm, accountType: 'Everyday'}); setShowOpenAccountForm(true); }}
                  className="w-full mt-8 bg-[#D4AF37] text-[#0B1221] font-semibold py-3 rounded-xl hover:bg-[#f5cc45] transition"
                >
                  Open Account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-6">
                  <Building className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#D4AF37]">
                    About Us
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                  Building a Better Banking Experience
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2015, Valtro Trust Finance has grown from a
                  Sydney-based startup to one of Australia's most trusted
                  digital banks. Our mission is simple: provide institutional-grade
                  financial services with the personal touch of a community bank.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  With over $2.5 billion in deposits and 150,000+ satisfied
                  customers, we're redefining what it means to bank in the
                  digital age. Our leadership team brings decades of experience
                  from leading global financial institutions.
                </p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-3xl font-bold text-[#D4AF37]">150K+</p>
                    <p className="text-sm text-gray-500">Active Customers</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#D4AF37]">$2.5B+</p>
                    <p className="text-sm text-gray-500">Deposits Protected</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#D4AF37]">4.9★</p>
                    <p className="text-sm text-gray-500">Customer Rating</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team collaborating at Valtro Trust Finance"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Financial Institutions Section */}
        <section id="institutions" className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-4">
                <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium text-[#D4AF37]">
                  Institutional Solutions
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                Financial Institutions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive banking solutions for businesses, corporations,
                and financial institutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop"
                  alt="Financial institution services"
                  className="rounded-2xl shadow-xl w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="space-y-6">
                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-all">
                      <Building className="w-6 h-6 text-[#D4AF37] group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0B1221] mb-1">
                        Corporate Banking
                      </h3>
                      <p className="text-gray-600">
                        Tailored lending, cash management, and treasury
                        solutions for businesses of all sizes.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-all">
                      <TrendingUp className="w-6 h-6 text-[#D4AF37] group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0B1221] mb-1">
                        Capital Markets
                      </h3>
                      <p className="text-gray-600">
                        Access to debt capital markets, syndicated loans, and
                        structured finance solutions.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 group">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-all">
                      <Globe className="w-6 h-6 text-[#D4AF37] group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0B1221] mb-1">
                        International Banking
                      </h3>
                      <p className="text-gray-600">
                        Cross-border payments, foreign exchange, and trade
                        finance services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section id="sustainability" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-4">
                <Leaf className="w-4 h-4 text-green-700" />
                <span className="text-xs font-medium text-green-700">
                  Our Commitment
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                Sustainability at Valtro
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Building a sustainable future through responsible banking and
                environmental stewardship.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">
                  Green Financing
                </h3>
                <p className="text-gray-600 text-sm">
                  $500M committed to renewable energy projects and sustainable
                  infrastructure across Australia.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">
                  Net Zero by 2035
                </h3>
                <p className="text-gray-600 text-sm">
                  Carbon-neutral operations across all our branches and data
                  centers by 2035.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">
                  Community Investment
                </h3>
                <p className="text-gray-600 text-sm">
                  $10M+ donated to local community projects and financial
                  literacy programs since 2020.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Careers Section */}
        <section id="careers" className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-6">
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#D4AF37]">
                    Join Our Team
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                  Shape the Future of Banking
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  At Valtro, we're building a team of passionate innovators who
                  want to make a difference. From engineering to customer
                  success, we offer challenging roles with real impact.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">
                      Competitive salary and equity packages
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">
                      Flexible work arrangements (remote/hybrid)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">
                      Professional development budget
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">
                      5 weeks annual leave + wellness days
                    </span>
                  </div>
                </div>
                <button className="bg-[#D4AF37] hover:bg-[#f5cc45] text-[#0B1221] font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                  View Open Positions <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Career opportunities at Valtro"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Investor Relations Section */}
        <section id="investors" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-4">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium text-[#D4AF37]">
                  Investor Relations
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                Transparent. Accountable. Growing.
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Valtro Trust Finance is committed to delivering long-term value
                for our shareholders through sustainable growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop"
                  alt="Investor presentation"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#0B1221] mb-2">
                    Annual Report 2024
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Download our latest annual report to learn about our
                    financial performance, strategic initiatives, and future
                    outlook.
                  </p>
                  <button className="text-[#D4AF37] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Download PDF <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
                <h3 className="text-xl font-semibold text-[#0B1221] mb-4">
                  Stock Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500">ASX Code</span>
                    <span className="font-semibold text-[#0B1221]">VTF</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500">Share Price (AUD)</span>
                    <span className="font-semibold text-[#0B1221]">$12.45</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500">Market Cap</span>
                    <span className="font-semibold text-[#0B1221]">
                      $3.2B
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500">Dividend Yield</span>
                    <span className="font-semibold text-[#0B1221]">4.2%</span>
                  </div>
                </div>
                <button className="w-full mt-6 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1221] font-semibold py-2 rounded-lg transition-colors">
                  View Investor Centre
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section id="support" className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-4">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-medium text-[#D4AF37]">
                  Customer Support
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                We're Here to Help 24/7
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our dedicated support team is always ready to assist you with any questions or concerns.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">Call Us</h3>
                <p className="text-gray-600">1300 000 VTF</p>
                <p className="text-sm text-gray-500">24/7 Support Line</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">Email Us</h3>
                <p className="text-gray-600">hello@valtrotrust.com.au</p>
                <p className="text-sm text-gray-500">Response within 2 hours</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1221] mb-2">Visit Us</h3>
                <p className="text-gray-600">Level 22, 161 Castlereagh St</p>
                <p className="text-sm text-gray-500">Sydney NSW 2000</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 rounded-full px-4 py-1.5 mb-6">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#D4AF37]">
                    Enterprise Security
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0B1221] mb-4">
                  Your Security is Our Priority
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We employ multiple layers of security to protect your account and personal information. From advanced encryption to real-time fraud monitoring, we've got you covered.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">256-bit SSL Encryption</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">Multi-factor Authentication</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">24/7 Fraud Monitoring</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-gray-600">Biometric Authentication</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#0B1221] to-[#1a2538] rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-[#D4AF37]" />
                  <span className="font-semibold">Certified Secure</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Valtro Trust Finance is ISO 27001 certified and complies with the highest industry standards for information security management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Footer */}
        <footer className="bg-[#0B1221] text-gray-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Legal Info Column */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo_no_bg.png" alt="Valtro Logo" className="h-8 w-auto brightness-0 invert" />
                  <span className="font-semibold text-white text-base">
                    Valtro Trust Finance
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p>ABN: 00 000 000 000</p>
                  <p>AFSL: 000000</p>
                  <p>Level 22, 161 Castlereagh St, Sydney NSW 2000</p>
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="text-white font-semibold mb-2">Legal</h4>
                  <ul className="space-y-1">
                    <li>
                      <button onClick={() => scrollToSection('#security')} className="hover:text-[#D4AF37] transition-colors">
                        Privacy Policy
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollToSection('#security')} className="hover:text-[#D4AF37] transition-colors">
                        Terms of Use
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollToSection('#security')} className="hover:text-[#D4AF37] transition-colors">
                        Financial Services Guide
                      </button>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Support</h4>
                  <ul className="space-y-1">
                    <li>
                      <button onClick={() => scrollToSection('#support')} className="hover:text-[#D4AF37] transition-colors">
                        Contact Us
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollToSection('#support')} className="hover:text-[#D4AF37] transition-colors">
                        Complaints
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollToSection('#security')} className="hover:text-[#D4AF37] transition-colors">
                        Security Centre
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">
                  Get in Touch
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-[#D4AF37]" />
                    <span>1300 000 VTF (1300 000 883)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-[#D4AF37]" />
                    <span>hello@valtrotrust.com.au</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    <span>Sydney | Melbourne | Brisbane</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="border-t border-gray-800 pt-6 text-xs space-y-2">
              <p>
                <span className="font-semibold text-gray-300">
                  Financial Claims Scheme:
                </span>{" "}
                Deposits are protected under the Financial Claims Scheme (FCS)
                up to $250,000 per account holder per ADI. This guarantee is
                provided by the Australian Government.
              </p>
              <p>
                Valtro Trust Finance is a registered business name of Valtro
                Financial Pty Ltd (ABN 00 000 000 000 | AFSL 000000). Any advice
                provided is general only and does not take into account your
                objectives, financial situation, or needs.
              </p>
              <p className="text-gray-600">
                &copy; {new Date().getFullYear()} Valtro Trust Finance. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Sidebar Navigation */}
      <div className={`fixed inset-0 z-[150] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute right-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white shadow-2xl transition-transform duration-400 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <img src="/logo_no_bg.png" alt="Logo" className="h-8 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
            <nav className="space-y-6">
              {navigationItems.map((item) => (
                <div key={item.label} className="space-y-3">
                  <button 
                    onClick={() => {
                      if (!item.dropdown) {
                        scrollToSection(item.href);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="text-lg font-bold text-[#0B1221] hover:text-[#D4AF37] transition-colors"
                  >
                    {item.label}
                  </button>
                  {item.dropdown && (
                    <div className="pl-4 space-y-3 border-l-2 border-gray-100">
                      {item.dropdown.map((sub) => (
                        <button 
                          key={sub.label} 
                          onClick={() => {
                            scrollToSection(sub.href);
                            setIsMobileMenuOpen(false);
                          }}
                          className="block text-sm text-gray-500 hover:text-[#D4AF37] transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <button
              onClick={() => { setShowOpenAccountForm(true); setIsMobileMenuOpen(false); }}
              className="w-full bg-[#0B1221] text-white font-bold py-4 rounded-xl shadow-lg shadow-black/10"
            >
              Open Account
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal Overlay */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#0B1221] to-[#1a2538] p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
              </div>
              <button 
                onClick={() => {
                  setShowLoginForm(false);
                  setLoginMessage(null);
                  setLoginEmail("");
                  setLoginPassword("");
                  setIsLoading(false);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            {loginMessage && (
              <div className={`mx-6 mt-6 p-3 rounded-lg flex items-center gap-2 ${
                loginMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {loginMessage.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm">{loginMessage.text}</span>
              </div>
            )}

            <form className="p-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition text-[#0B1221] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-2">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition text-[#0B1221] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#D4AF37] focus:ring-[#D4AF37]" />
                  Remember me
                </label>
                <button type="button" className="text-[#D4AF37] hover:underline font-medium">Forgot password?</button>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4AF37] hover:bg-[#f5cc45] text-[#0B1221] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0B1221] border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false);
                    scrollToSection('#rates');
                  }}
                  className="text-[#D4AF37] hover:underline font-semibold"
                >
                  Open an account
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Open Account Modal */}
      {showOpenAccountForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#f5cc45] p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#0B1221]">Create Account</h2>
                <p className="text-[#0B1221]/70 text-sm mt-1">Join Valtro Trust Finance today</p>
              </div>
              <button 
                onClick={() => setShowOpenAccountForm(false)}
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#0B1221]" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleOpenAccount}>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="John Doe"
                  value={openAccountForm.name}
                  onChange={(e) => setOpenAccountForm({...openAccountForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="john@example.com"
                  value={openAccountForm.email}
                  onChange={(e) => setOpenAccountForm({...openAccountForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-1.5">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="••••••••"
                  value={openAccountForm.password}
                  onChange={(e) => setOpenAccountForm({...openAccountForm, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0B1221] mb-1.5">Account Type</label>
                <select 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none bg-white"
                  value={openAccountForm.accountType}
                  onChange={(e) => setOpenAccountForm({...openAccountForm, accountType: e.target.value})}
                >
                  <option value="Savings">Savings Account (5.35%)</option>
                  <option value="Term Deposit">Term Deposit (5.50%)</option>
                  <option value="Everyday">Everyday Account (0% Fees)</option>
                </select>
              </div>
              
              <p className="text-[10px] text-gray-500 leading-tight">
                By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy. You may receive SMS notifications from us.
              </p>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0B1221] text-white font-semibold py-3 rounded-xl shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign Up Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-0 inset-x-0 z-[200] p-4 sm:p-6 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-bold text-[#0B1221] flex items-center justify-center md:justify-start gap-2">
                We value your privacy <Info className="w-3 h-3 text-gray-400" />
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Valtro Trust Finance uses cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={() => setShowCookieConsent(false)} className="flex-1 md:flex-none px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-[#0B1221] transition-colors">Decline</button>
              <button 
                onClick={() => { localStorage.setItem('cookies_accepted', 'true'); setShowCookieConsent(false); }}
                className="flex-1 md:flex-none px-8 py-2.5 bg-[#0B1221] text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-black/10"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}