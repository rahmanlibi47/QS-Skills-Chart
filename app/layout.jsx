import './globals.css'
import Providers from '../components/Providers'

export const metadata = {
  title: 'QS Skill Metrics',
  description: 'Track skills',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/qs_skills.png" type="image/png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
