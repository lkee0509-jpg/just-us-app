'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/todos', label: 'Tasks', icon: '✓' },
  { href: '/song', label: 'Song', icon: '♪' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Navbar({ username }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Top bar on desktop */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(14,11,6,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,151,58,0.15)',
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="font-display" style={{ fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '-0.02em' }}>
          ✦ Just Us
        </span>
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '8px', textDecoration: 'none',
                background: path === n.href ? 'rgba(201,151,58,0.15)' : 'transparent',
                color: path === n.href ? 'var(--gold)' : 'var(--cream-muted)',
                fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
              }}>
              {n.icon} {n.label}
            </Link>
          ))}
          <button onClick={signOut}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--cream-muted)', fontSize: '0.85rem',
              fontFamily: 'Outfit', marginLeft: '0.5rem',
            }}>
            Sign out
          </button>
        </nav>
      </header>

      {/* Bottom nav on mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(14,11,6,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,151,58,0.15)',
        display: 'none', padding: '0.5rem 1rem',
        gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem',
        id: 'mobile-nav',
      }}
      className="mobile-nav">
        {NAV.map(n => (
          <Link key={n.href} href={n.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '0.5rem', borderRadius: '8px', textDecoration: 'none',
              color: path === n.href ? 'var(--gold)' : 'var(--cream-muted)',
              fontSize: '0.7rem', gap: '0.2rem',
            }}>
            <span style={{ fontSize: '1.2rem' }}>{n.icon}</span>
            {n.label}
          </Link>
        ))}
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .mobile-nav { display: grid !important; }
          header nav { display: none; }
        }
      `}</style>
    </>
  )
}
