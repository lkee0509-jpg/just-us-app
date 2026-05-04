import './globals.css'

export const metadata = {
  title: 'Just Us',
  description: 'Our private little world.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
