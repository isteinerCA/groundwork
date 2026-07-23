import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getEntitlement } from "@/lib/auth/entitlements";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/pricing",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const email = (user?.email ?? token.email) as string | undefined;
      if (email && (user || trigger === "update")) {
        const ent = await getEntitlement(email);
        token.seasonPassActive = ent.seasonPassActive;
        token.seasonPassExpires = ent.seasonPassExpires;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.seasonPassActive = Boolean(token.seasonPassActive);
        session.user.seasonPassExpires = (token.seasonPassExpires as string | null) ?? null;
      }
      return session;
    },
  },
});
