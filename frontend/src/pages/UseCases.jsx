import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { USE_CASE_CATEGORIES, ICONS, ITEM_ICON_MAP } from '../data/useCases'

function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name] || ICONS.globe} />
    </svg>
  )
}

export default function UseCases() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm px-4 py-1 rounded-full mb-6">
          Use Cases
        </div>
        <h1 className="text-5xl font-extrabold mb-4">
          How people use <span className="text-purple-400">ProxyToro</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          From data collection to brand protection — explore every way ProxyToro powers real-world applications.
        </p>
      </section>

      {/* All categories */}
      <section className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
        {USE_CASE_CATEGORIES.map(cat => (
          <div key={cat.category}>
            <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-800">
              {cat.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map(item => (
                <Link
                  key={item.slug}
                  to={`/use-cases/${item.slug}`}
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-5 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-600/10 group-hover:bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <Icon name={ITEM_ICON_MAP[item.slug] || 'globe'} className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {item.name}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of users already using ProxyToro.</p>
          <Link
            to="/register"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
