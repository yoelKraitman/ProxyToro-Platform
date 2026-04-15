import { useState } from 'react'
import { Link } from 'react-router-dom'

const PROXY_TYPES = ['Rotating Residential', 'Static Residential', 'Mobile', 'Datacenter']

// Tiered per-GB pricing — more GB = cheaper rate
const TIERS = {
  'Rotating Residential': [
    { min: 1,    max: 9,         perGb: 3.00 },
    { min: 10,   max: 49,        perGb: 2.50 },
    { min: 50,   max: 199,       perGb: 1.80 },
    { min: 200,  max: 499,       perGb: 1.20 },
    { min: 500,  max: 999,       perGb: 0.80 },
    { min: 1000, max: Infinity,  perGb: 0.55 },
  ],
  'Static Residential': [
    { min: 1,    max: 9,         perGb: 4.00 },
    { min: 10,   max: 49,        perGb: 3.50 },
    { min: 50,   max: 199,       perGb: 2.80 },
    { min: 200,  max: 499,       perGb: 2.00 },
    { min: 500,  max: 999,       perGb: 1.50 },
    { min: 1000, max: Infinity,  perGb: 1.20 },
  ],
  'Mobile': [
    { min: 1,    max: 9,         perGb: 8.00 },
    { min: 10,   max: 49,        perGb: 7.00 },
    { min: 50,   max: 199,       perGb: 5.50 },
    { min: 200,  max: 499,       perGb: 4.00 },
    { min: 500,  max: 999,       perGb: 3.00 },
    { min: 1000, max: Infinity,  perGb: 2.50 },
  ],
  'Datacenter': [
    { min: 1,    max: 9,         perGb: 1.00 },
    { min: 10,   max: 49,        perGb: 0.80 },
    { min: 50,   max: 199,       perGb: 0.60 },
    { min: 200,  max: 499,       perGb: 0.40 },
    { min: 500,  max: 999,       perGb: 0.30 },
    { min: 1000, max: Infinity,  perGb: 0.25 },
  ],
}

function getRate(type, gb) {
  const tier = TIERS[type].find(t => gb >= t.min && gb <= t.max)
  return tier ? tier.perGb : TIERS[type].at(-1).perGb
}

// showBuyButton: true in Dashboard (triggers onBuy callback)
// showBuyButton: false in Landing (renders a Link to /register)
export default function PricingCalculator({ showBuyButton = false, onBuy }) {
  const [proxyType, setProxyType] = useState('Rotating Residential')
  const [gb, setGb] = useState(10)

  const perGb    = getRate(proxyType, gb)
  const basePerGb = TIERS[proxyType][0].perGb
  const total    = (perGb * gb).toFixed(2)
  const discount = Math.round((1 - perGb / basePerGb) * 100)
  const isEnterprise = gb >= 1000

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8">

      {/* Proxy type tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PROXY_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setProxyType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              proxyType === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left — slider + tier badges */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm text-gray-400 font-medium">Bandwidth</label>
            <span className="text-purple-400 font-bold text-xl">{gb} GB</span>
          </div>

          <input
            type="range"
            min={1}
            max={1000}
            value={gb}
            onChange={e => setGb(Number(e.target.value))}
            className="proxy-slider w-full"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-2 mb-6">
            <span>1 GB</span>
            <span>1000 GB</span>
          </div>

          {/* Tier badges — highlights current active tier */}
          <div className="flex flex-wrap gap-2">
            {TIERS[proxyType].map((tier, i) => {
              const active = gb >= tier.min && (tier.max === Infinity ? true : gb <= tier.max)
              return (
                <span
                  key={i}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    active
                      ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                      : 'border-gray-700 text-gray-500'
                  }`}
                >
                  {tier.max === Infinity ? `${tier.min}+ GB` : `${tier.min}–${tier.max} GB`}
                  {' · '}${tier.perGb.toFixed(2)}/GB
                </span>
              )
            })}
          </div>
        </div>

        {/* Right — live price summary */}
        <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Proxy type</span>
            <span className="text-white text-sm font-medium">{proxyType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Bandwidth</span>
            <span className="text-white font-semibold">{gb} GB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Price per GB</span>
            <span className="text-white font-semibold">${perGb.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Volume discount</span>
              <span className="text-green-400 font-semibold">-{discount}%</span>
            </div>
          )}

          <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
            <span className="text-white font-semibold text-lg">Total</span>
            <div className="text-right">
              {discount > 0 && (
                <p className="text-gray-500 text-sm line-through">
                  ${(basePerGb * gb).toFixed(2)}
                </p>
              )}
              <p className="text-3xl font-bold text-purple-400">${total}</p>
            </div>
          </div>

          {isEnterprise ? (
            <a
              href="mailto:sales@proxytoro.com"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Contact Sales
            </a>
          ) : showBuyButton ? (
            <button
              onClick={() => onBuy?.({ type: proxyType, gb: Number(gb), total: Number(total) })}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Purchase Now
            </button>
          ) : (
            <Link
              to="/register"
              className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Get Started
            </Link>
          )}

          {isEnterprise && (
            <p className="text-xs text-gray-500 text-center">
              Enterprise plans include dedicated account manager & SLA
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
