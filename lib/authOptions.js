import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

const authOptions = {
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_ID || '', clientSecret: process.env.GOOGLE_SECRET || '' }),
    GitHubProvider({ clientId: process.env.GITHUB_ID || '', clientSecret: process.env.GITHUB_SECRET || '' })
  ],
  callbacks: {
    async session({ session, user }) {
      // expose user id if needed
      session.userId = user?.id
      return session
    }
  }
}

export default authOptions
