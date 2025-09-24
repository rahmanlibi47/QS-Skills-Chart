import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'My Skills App',
  description: 'Track skills with charts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
