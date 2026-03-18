import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For Demo: Any user with password 'admin123' can log in
        if (credentials?.email && credentials?.password === "admin123") {
          return { id: "1", name: "Tejas", email: credentials.email };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "yoursecret",
});

export { handler as GET, handler as POST };