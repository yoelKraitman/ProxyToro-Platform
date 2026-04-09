import { Link } from 'react-router-dom'

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

const plans = [
  { name: 'Starter', price: '$9', bandwidth: '10 GB', proxies: '100' },
  { name: 'Pro', price: '$29', bandwidth: '50 GB', proxies: '500', popular: true },
  { name: 'Business', price: '$79', bandwidth: '200 GB', proxies: 'Unlimited' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-purple-400">ProxyToro</h1>
        <div className="flex items-center gap-2 sm:gap-4">
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm px-4 py-1 rounded-full mb-6">
          Fast · Reliable · Anonymous
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          The Proxy Platform<br />
          <span className="text-purple-400">Built for Everyone</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Generate high-quality residential and datacenter proxies instantly.
          Manage everything from one powerful dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Start Free Trial
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { value: '50+', label: 'Countries' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Support' },
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
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need in one place
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-gray-400 text-center mb-12">No hidden fees. Cancel anytime.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`bg-gray-900 rounded-2xl p-6 border relative ${
                plan.popular ? 'border-purple-500' : 'border-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-purple-400 mb-4">
                {plan.price}<span className="text-sm text-gray-400">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li>✓ {plan.bandwidth} bandwidth</li>
                <li>✓ {plan.proxies} proxies</li>
                <li>✓ All locations</li>
                <li>✓ 24/7 support</li>
              </ul>
              <Link
                to="/register"
                className={`block text-center py-2 rounded-lg text-sm font-semibold transition ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border border-gray-700 hover:border-purple-500 text-gray-300'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users already using ProxyToro.</p>
          <Link
            to="/register"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-500 text-sm">
        © 2026 ProxyToro. All rights reserved.
      </footer>

    </div>
  )
}
