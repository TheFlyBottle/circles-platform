import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { validateAdminCredentials } from '@/lib/admin-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'development-admin-auth-secret-change-me',
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24
  },
  pages: {
    signIn: '/admin/login'
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        const admin = await validateAdminCredentials(credentials?.email, credentials?.password);
        if (!admin) return null;

        return {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          forcePasswordChange: admin.forcePasswordChange
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.forcePasswordChange = user.forcePasswordChange;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'admin';
        session.user.forcePasswordChange = Boolean(token.forcePasswordChange);
      }

      return session;
    }
  }
});
