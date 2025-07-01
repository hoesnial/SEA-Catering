import DOMPurify from 'isomorphic-dompurify';

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize HTML to prevent XSS
  html(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  // Sanitize text input
  text(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  // Sanitize email
  email(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[<>'"]/g, '');
  },

  // Sanitize phone number
  phone(input: string): string {
    return input
      .replace(/[^\d+\-\s()]/g, '') // Only allow digits, +, -, space, parentheses
      .trim();
  },

  // Sanitize array of strings
  stringArray(input: string[]): string[] {
    return input.map(item => this.text(item)).filter(item => item.length > 0);
  }
};

// CSRF token management
export const csrfService = {
  // Generate CSRF token
  generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Store CSRF token in session storage
  storeToken(token: string): void {
    sessionStorage.setItem('csrf_token', token);
  },

  // Get CSRF token from session storage
  getToken(): string | null {
    return sessionStorage.getItem('csrf_token');
  },

  // Validate CSRF token
  validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token && token.length === 64;
  },

  // Clear CSRF token
  clearToken(): void {
    sessionStorage.removeItem('csrf_token');
  }
};

// Form validation utilities
export const validateForm = {
  // Validate required fields
  required(value: string, fieldName: string): string | null {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Validate email format
  email(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Validate Indonesian phone number
  indonesianPhone(phone: string): string | null {
    const phoneRegex = /^08\d{8,11}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid Indonesian phone number (08xxxxxxxxx)';
    }
    return null;
  },

  // Validate rating (1-5)
  rating(rating: number): string | null {
    if (rating < 1 || rating > 5) {
      return 'Rating must be between 1 and 5';
    }
    return null;
  },

  // Validate text length
  textLength(text: string, minLength: number, maxLength: number, fieldName: string): string | null {
    if (text.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    if (text.length > maxLength) {
      return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return null;
  }
};

// Security headers and configurations
export const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'connect-src': "'self' https://*.supabase.co",
    'font-src': "'self'",
    'object-src': "'none'",
    'media-src': "'self'",
    'frame-src': "'none'"
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
};

// Rate limiting (client-side tracking)
export const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number }>(),

  // Check if action is rate limited
  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return false;
    }

    // Reset if window has passed
    if (now - attempt.lastAttempt > windowMs) {
      this.attempts.set(key, { count: 1, lastAttempt: now });
      return false;
    }

    // Increment attempt count
    attempt.count++;
    attempt.lastAttempt = now;

    return attempt.count > maxAttempts;
  },

  // Clear rate limit for key
  clearRateLimit(key: string): void {
    this.attempts.delete(key);
  }
};