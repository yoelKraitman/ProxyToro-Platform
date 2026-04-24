import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { USE_CASE_CATEGORIES, ICONS, ITEM_ICON_MAP } from '../data/useCases'

function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name] || ICONS.globe} />
    </svg>
  )
}

export default function Navbar() {
  const [showUseCases, setShowUseCases] = useState(false)
  const timerRef = useRef(null)

  const openMenu = () => {
    clearTimeout(timerRef.current)
    setShowUseCases(true)
  }
  const closeMenu = () => {
    timerRef.current = setTimeout(() => setShowUseCases(false), 150)
  }

  return (
    <div className="relative border-b border-gray-800 bg-gray-950 z-40">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-purple-400 shrink-0">ProxyToro</Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-6 text-sm text-gray-400">
          {/* Use cases trigger */}
          <div
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <button
              className={`flex items-center gap-1 transition hover:text-white ${showUseCases ? 'text-white' : ''}`}
            >
              Use cases
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`w-3 h-3 transition-transform duration-200 ${showUseCases ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showUseCases && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" style={{ transform: 'translateY(calc(100% + 16px))' }} />
            )}
          </div>

          <a href="/#integration" className="hover:text-white transition">Integration</a>
          <a href="/#pricing" className="hover:text-white transition">Pricing</a>
          <a href="/#affiliate" className="hover:text-white transition">Become an affiliate</a>
          <a href="/#faq" className="hover:text-white transition">FAQ</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm transition hidden sm:block">
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Mega menu dropdown — always in DOM, animated with opacity + translate */}
      <div
        className="absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 shadow-2xl z-50 transition-all duration-250 ease-out"
        style={{
          opacity: showUseCases ? 1 : 0,
          transform: showUseCases ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: showUseCases ? 'auto' : 'none',
          transitionDuration: showUseCases ? '220ms' : '160ms',
        }}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Category columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {USE_CASE_CATEGORIES.map((cat, catIdx) => (
              <div
                key={cat.category}
                style={{
                  opacity: showUseCases ? 1 : 0,
                  transform: showUseCases ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 220ms ease-out ${80 + catIdx * 35}ms, transform 220ms ease-out ${80 + catIdx * 35}ms`,
                }}
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 leading-tight">
                  {cat.category}
                </p>
                <ul className="space-y-2.5">
                  {cat.items.map(item => (
                    <li key={`${cat.category}-${item.slug}`}>
                      <Link
                        to={`/use-cases/${item.slug}`}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors group"
                        onClick={() => setShowUseCases(false)}
                      >
                        <span className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0">
                          <Icon name={ITEM_ICON_MAP[item.slug] || 'globe'} />
                        </span>
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div
            className="mt-8 pt-6 border-t border-gray-800"
            style={{
              opacity: showUseCases ? 1 : 0,
              transform: showUseCases ? 'translateY(0)' : 'translateY(6px)',
              transition: `opacity 220ms ease-out 290ms, transform 220ms ease-out 290ms`,
            }}
          >
            <Link
              to="/use-cases"
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/30 rounded-xl px-6 py-4 transition-all group"
              onClick={() => setShowUseCases(false)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Explore all use cases</p>
                  <p className="text-xs text-gray-400 mt-0.5">See how ProxyToro powers real-world applications</p>
                </div>
              </div>
              <Icon name="arrowRight" className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
