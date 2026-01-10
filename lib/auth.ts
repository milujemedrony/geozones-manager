import NextAuth, { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  verifyPassword,
  getUserFromDbByEmail,
} from "@/lib/user";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  debug: process.env.NODE_ENV !== "production",
  cookies: {
    sessionToken: {
      name: `session`,
      options: {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
    callbackUrl: {
      name: `callback-url`,
      options: {
        path: "/",
        sameSite: "none",
        secure: true,
      },
    },
    csrfToken: {
      name: `csrf-token`,
      options: {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) throw new Error("No credentials provided.");
        const email = credentials.email.toLocaleLowerCase();
        const user = await getUserFromDbByEmail(email);

        if (!user) throw new Error("Unauthorized");

        const isValidPassword = await verifyPassword(
          user.password || "",
          credentials.password
        );

        if (!isValidPassword) throw new Error("Unauthorized");

        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
  ].filter(Boolean),
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.userId = account.providerAccountId;
      }

      return token;
    },
    async session({ session, token }) {
      try {
        const userData = await getUserFromDbByEmail(token.email || "");

        if (!userData) throw new Error("User data not found in the database");
        // @ts-ignore
        session.user.id = userData.id;
        // @ts-ignore
        session.user.email = userData.email;

        return session;
      } catch (error) {
        console.error("Error in session function:", error);
        throw new Error("Failed to update session data");
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const getServerAuthSession = () => getServerSession(authOptions);