import { Link, useParams, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { USE_CASE_DETAILS, ICONS, ITEM_ICON_MAP } from '../data/useCases'

function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name] || ICONS.globe} />
    </svg>
  )
}

export default function UseCase() {
  const { slug } = useParams()
  const data = USE_CASE_DETAILS[slug]

  if (!data) return <Navigate to="/use-cases" replace />

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <Link
          to="/use-cases"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All use cases
        </Link>

        <div className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm px-3 py-1 rounded-full mb-4">
          {data.category}
        </div>

        <h1 className="text-5xl font-extrabold mb-6">{data.title}</h1>
        <p className="text-xl text-gray-400 leading-relaxed mb-4">{data.shortDesc}</p>
        <p className="text-gray-500 leading-relaxed">{data.longDesc}</p>
      </section>

      {/* How proxies are used + Benefits */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How proxies are used */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Icon name={ITEM_ICON_MAP[slug] || 'globe'} className="w-4 h-4 text-purple-400" />
              </div>
              How proxies are used
            </h2>
            <ul className="space-y-4">
              {data.howUsed.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Icon name="checkCircle" className="w-4 h-4 text-purple-400" />
              </div>
              Benefits
            </h2>
            <ul className="space-y-4">
              {data.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400 shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          {[
            { value: '88M+', label: 'Residential IPs' },
            { value: '78+', label: 'Countries' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-purple-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-purple-600/10 border border-purple-500/20 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Start using ProxyToro for {data.title}</h2>
          <p className="text-gray-400 mb-8">Get started in minutes. No credit card required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              Get Started
            </Link>
            <Link
              to="/#pricing"
              className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
