import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname === "/login";
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      // Allow auth routes without login
      if (isAuthRoute) {
        return true;
      }

      // Allow login page without login
      if (isOnLoginPage) {
        return true;
      }

      // All other pages require login
      if (!isLoggedIn) {
        return false;
      }

      // Check whitelist
      const allowedLogins = process.env.ALLOWED_GITHUB_LOGINS?.split(",").map((s) => s.trim()) || [];
      const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(",").map((s) => s.trim()) || [];

      // Fail-safe: if no whitelist configured, deny access
      if (allowedLogins.length === 0 && allowedDomains.length === 0) {
        return false;
      }

      const username = (auth.user as any).login || (auth.user as any).name;
      const email = auth.user?.email || "";

      // Check if username is in whitelist
      if (allowedLogins.length > 0 && username && allowedLogins.includes(username)) {
        return true;
      }

      // Check if email domain is in whitelist
      if (allowedDomains.length > 0 && email) {
        const emailDomain = email.split("@")[1];
        if (emailDomain && allowedDomains.includes(emailDomain)) {
          return true;
        }
      }

      // Not whitelisted
      return false;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.login = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).login = token.login;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
