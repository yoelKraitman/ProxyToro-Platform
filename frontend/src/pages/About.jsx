import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const stats = [
  { value: '80M+', label: 'Residential IPs' },
  { value: '78+',  label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              About Us
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Built for Businesses<br className="hidden sm:block" /> That Operate at Scale
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
              ProxyToro is a proxy infrastructure platform focused on providing premium residential proxies
              for businesses that operate with data at scale.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
            {stats.map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-6 text-center">
                <p className="text-3xl font-bold text-purple-400 mb-1">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-white font-bold text-xl mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed">
                With access to over 80 million residential IPs worldwide, our goal is to simplify access
                to high-quality proxies through a clean interface, stable performance, no data loss, and
                transparent pricing.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-white font-bold text-xl mb-4">Who We Serve</h2>
              <p className="text-gray-400 leading-relaxed">
                We primarily serve companies focused on data extraction, automation, market research,
                and large-scale web operations. Our mission is to provide customers with fair pricing
                and long-term yearly plans that allow them to scale efficiently and achieve better results.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-purple-600/10 border border-purple-500/20 rounded-2xl px-6 py-10 text-center">
            <h3 className="text-white font-bold text-xl mb-2">Ready to get started?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Join businesses worldwide using ProxyToro for reliable, geo-targeted proxy access.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
              >
                Get Started
              </Link>
              <Link
                to="/contact"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
              >
                Contact Sales
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
