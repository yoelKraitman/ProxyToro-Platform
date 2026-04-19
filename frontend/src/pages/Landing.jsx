import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import PricingCalculator from '../components/PricingCalculator'

const features = [
  {
    icon: '🌍',
    title: 'Global Locations',
    desc: 'Access proxies from 50+ countries including US, UK, Germany, Israel and more.'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'High-speed residential and datacenter proxies with 99.9% uptime guarantee.'
  },
  {
    icon: '🔒',
    title: 'Fully Anonymous',
    desc: 'Your identity is always protected. No logs, no tracking, no exposure.'
  },
  {
    icon: '🎛️',
    title: 'Easy Dashboard',
    desc: 'Generate, manage and monitor your proxies from one simple dashboard.'
  },
  {
    icon: '💳',
    title: 'Crypto Payments',
    desc: 'Pay privately with Bitcoin, Ethereum, USDT and 100+ other cryptocurrencies.'
  },
  {
    icon: '🛡️',
    title: 'White-Label Ready',
    desc: 'All proxies are fully branded under ProxyToro. No third-party exposure.'
  },
]

// Delay class by card index (0-based)
const delayClass = ['', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4', 'reveal-d5', 'reveal-d6']

export default function Landing() {

  // Set up IntersectionObserver for all .reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-4 sm:px-6 py-4 max-w-6xl mx-auto flex items-center justify-between gap-6">
        <h1 className="text-xl font-bold text-purple-400 shrink-0">ProxyToro</h1>

        {/* Main menu */}
        <div className="hidden lg:flex items-center gap-6 text-sm text-gray-400">
          <a href="#use-cases" className="hover:text-white transition">Use cases</a>
          <a href="#integration" className="hover:text-white transition">Integration</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#affiliate" className="hover:text-white transition">Become an affiliate</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>

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

      {/* Hero — entrance animation on page load (not scroll-triggered) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="hero-animate inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm px-4 py-1 rounded-full mb-6">
          88M+ Residential & ISP Proxies · Built for Reliability · Annual Plans · No Data Loss
        </div>
        <h1 className="hero-animate-d1 text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          The Proxy Platform<br />
          <span className="text-purple-400">Built for Everyone</span>
        </h1>
        <p className="hero-animate-d2 text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Generate high-quality residential and datacenter proxies instantly.
          Manage everything from one powerful dashboard.
        </p>
        <div className="hero-animate-d3 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-animate-d4 grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { value: '78+',   label: 'Countries' },
            { value: '99.9%', label: 'Uptime'    },
            { value: '24/7',  label: 'Support'   },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-purple-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="reveal text-3xl font-bold text-center mb-12">
          Everything you need in one place
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal ${delayClass[i]} bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="reveal text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="reveal reveal-d1 text-gray-400 text-center mb-12">Pay only for what you use. More bandwidth = lower price per GB.</p>
        <div className="reveal reveal-d2">
          <PricingCalculator />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="reveal bg-purple-600/10 border border-purple-500/20 rounded-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users already using ProxyToro.</p>
          <Link
            to="/register"
            className="inline-block whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  )
}
