import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import authOptions from '../../../../lib/authOptions'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
