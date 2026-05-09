import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CONNECTION = [
  { param: 'Host',     value: 'gate.proxytoro.com' },
  { param: 'Port',     value: '8080' },
  { param: 'Protocol', value: 'HTTP / HTTPS / SOCKS5' },
  { param: 'Username', value: 'your-username-country-us' },
  { param: 'Password', value: 'your-password' },
]

const browsers = [
  {
    id: 'dolphin',
    name: 'Dolphin Anty',
    desc: 'Popular for managing multiple accounts, affiliate marketing, and ad arbitrage.',
    steps: [
      { title: 'Open Dolphin Anty and go to Profiles', body: "Click 'New Profile' in the top navigation." },
      { title: 'Name your profile', body: "Give the profile a descriptive name (e.g., 'US Residential — Account 1')." },
      { title: 'Navigate to the Proxy tab', body: "Inside the profile creation screen, click the 'Proxy' tab on the left side." },
      { title: 'Select HTTP as the proxy type', body: 'Use the dropdown to select HTTP (or SOCKS5 if preferred).' },
      { title: 'Enter ProxyToro details', body: 'Fill in: Host → gate.proxytoro.com, Port → 8080, Username → your-username-country-us, Password → your-password.' },
      { title: "Click 'Check Proxy'", body: 'Dolphin Anty will verify the connection and display your resolved IP and location.' },
      { title: 'Save and Launch', body: "Click 'Create Profile', then press the Play button to launch the browser with your proxy active." },
    ],
    troubleshooting: [
      'Proxy check fails: double-check your username and password from the ProxyToro dashboard.',
      'Wrong IP location: verify the country code in your username string.',
      'Slow connection: try switching from HTTP to SOCKS5 in the proxy type dropdown.',
      'Profile detected: ensure fingerprint randomization is enabled in the Dolphin Anty profile settings.',
    ],
  },
  {
    id: 'adspower',
    name: 'AdsPower',
    desc: 'Widely used for e-commerce, social media, and affiliate marketing — manage thousands of accounts from one machine.',
    steps: [
      { title: "Open AdsPower and click 'New Profile'", body: "From the main dashboard, click the blue '+ New Profile' button." },
      { title: 'Fill in the Profile Name', body: 'Give your profile a recognizable name for easy management.' },
      { title: 'Open the Proxy section', body: "Scroll down to the 'Proxy' section within the profile creation form." },
      { title: 'Select Proxy Type', body: "Choose HTTP from the 'Proxy Type' dropdown. SOCKS5 is also supported." },
      { title: 'Enter proxy details', body: 'Proxy Type → HTTP, Host → gate.proxytoro.com, Port → 8080, Username → your-username-country-us, Password → your-password.' },
      { title: "Click 'Test Proxy'", body: 'AdsPower will confirm the connection and display your resolved IP address and country.' },
      { title: 'Configure browser fingerprint', body: 'Set OS, resolution, language, and WebRTC settings to match your target location.' },
      { title: 'Save and Open', body: "Click 'OK' to save, then click 'Open' to launch the profile." },
    ],
    extra: {
      title: 'Team & Bulk Setup',
      body: "For teams managing many profiles, use AdsPower's Import feature. Prepare a CSV with one proxy string per row:",
      code: 'ProfileName,http,gate.proxytoro.com,8080,username-country-us,password\nProfileName2,http,gate.proxytoro.com,8080,username-country-de,password',
    },
    troubleshooting: [
      'Test fails: confirm credentials are copied exactly from your ProxyToro dashboard.',
      'IP mismatch: ensure the country code in the username matches your intended target.',
      'Session detected: enable Canvas and WebGL noise in AdsPower fingerprint settings.',
    ],
  },
  {
    id: 'multilogin',
    name: 'Multilogin',
    desc: 'Enterprise-grade antidetect browser trusted by large teams. Mimic (Chromium) and Stealthfox (Firefox) with deep fingerprint control.',
    steps: [
      { title: 'Log into Multilogin and open the Dashboard', body: 'Navigate to app.multilogin.com or open the desktop app.' },
      { title: "Click 'Create Profile'", body: 'Select either Mimic (Chrome-based) or Stealthfox (Firefox-based) depending on your use case.' },
      { title: 'Go to the Proxy tab', body: "Inside the profile editor, click the 'Proxy' tab in the left panel." },
      { title: 'Choose HTTP proxy type', body: "Select 'HTTP' from the proxy type options. Multilogin also supports SOCKS5." },
      { title: 'Enter your ProxyToro credentials', body: 'Host → gate.proxytoro.com, Port → 8080, Username → your-username-country-us, Password → your-password.' },
      { title: 'Run the connection test', body: "Click 'Test Proxy'. Multilogin shows the resolved IP, ASN, and country." },
      { title: 'Match fingerprint to location', body: 'Set the browser language, timezone, and geolocation to match the proxy country. Multilogin can auto-fill these based on the resolved IP.' },
      { title: 'Save and Start Profile', body: "Click 'Save', then 'Start' to open the browser profile with the proxy active." },
    ],
    troubleshooting: [
      "'Proxy unreachable' error: verify the port is 8080 and not blocked by your firewall.",
      'WebRTC leak: enable the WebRTC leak prevention option inside Multilogin profile settings.',
      "Timezone mismatch: use Multilogin's auto-timezone option to sync with the proxy's location.",
    ],
  },
  {
    id: 'gologin',
    name: 'GoLogin',
    desc: 'Cross-platform antidetect browser with cloud profile syncing. Popular among affiliate marketers, dropshippers, and social media managers.',
    steps: [
      { title: 'Open GoLogin', body: 'Log into app.gologin.com or launch the desktop client.' },
      { title: 'Create a New Profile', body: "Click 'Create Profile' in the top-right corner." },
      { title: 'Go to the Proxy section', body: "Inside the profile editor, click 'Proxy' in the left sidebar." },
      { title: "Select 'HTTP' as proxy type", body: 'You can also select SOCKS5 if preferred.' },
      { title: 'Fill in the proxy fields', body: 'Host → gate.proxytoro.com, Port → 8080, Username → your-username-country-us, Password → your-password.' },
      { title: "Click 'Check Proxy'", body: "GoLogin will resolve the IP and confirm the location. A green checkmark means you're good to go." },
      { title: 'Configure fingerprint', body: 'GoLogin auto-suggests OS, language, and timezone based on the proxy location. Accept or customize as needed.' },
      { title: 'Save and Run Profile', body: "Click 'Save Profile', then 'Run' to launch the browser." },
    ],
    troubleshooting: [
      'Red X on proxy check: re-enter credentials carefully — passwords are case-sensitive.',
      "'Connection timeout': try switching to SOCKS5 or contact ProxyToro support to verify your plan is active.",
      'Detected account: make sure Canvas fingerprint randomization is turned on in the GoLogin profile.',
    ],
  },
  {
    id: 'octo',
    name: 'Octo Browser',
    desc: 'Professional antidetect browser built for high-volume operations — supports team collaboration, profile sharing, and automation via API.',
    steps: [
      { title: 'Open Octo Browser', body: 'Download and launch Octo Browser from octobrowser.net, then log into your account.' },
      { title: "Click 'Create Profile'", body: "In the top-right of the dashboard, click the green '+ Create Profile' button." },
      { title: 'Navigate to the Proxy tab', body: "In the profile editor, select the 'Proxy' tab." },
      { title: 'Enter proxy details manually', body: "Select 'HTTP' as the connection type and fill in: Host → gate.proxytoro.com, Port → 8080, Login → your-username-country-us, Password → your-password." },
      { title: 'Test the connection', body: "Click 'Test Proxy' — Octo Browser will confirm your IP and resolve your geolocation." },
      { title: 'Auto-fill fingerprint from proxy', body: "Click 'Fill from proxy IP' — Octo Browser will auto-set timezone, language, and geolocation to match the proxy location." },
      { title: 'Save and Start Profile', body: "Click 'Create', then click 'Start' on the profile card to open the browser." },
    ],
    troubleshooting: [
      'Test shows wrong country: update the country code in your username (e.g., -country-gb for UK).',
      "'Authorization failed': passwords must match exactly — no trailing spaces.",
      'High latency: ISP proxies offer faster speeds — contact ProxyToro to switch your plan type.',
      "Automation issues: use Octo's API to programmatically assign fresh ProxyToro strings to new profiles.",
    ],
  },
]

export default function Integration() {
  const [activeTab, setActiveTab] = useState('dolphin')

  const browser = browsers.find(b => b.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Integration Guide
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Connect ProxyToro to Any<br className="hidden sm:block" /> Antidetect Browser
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Step-by-step setup for Dolphin Anty, AdsPower, Multilogin, GoLogin, and Octo Browser.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">

          {/* Connection details */}
          <div className="mb-12">
            <h2 className="text-white font-semibold text-lg mb-4">Your Connection Details</h2>
            <p className="text-gray-400 text-sm mb-5">
              These credentials apply to all browsers. Your username and password are found in your{' '}
              <Link to="/dashboard" className="text-purple-400 hover:underline">ProxyToro dashboard</Link> after creating an account.
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-6 py-3 w-1/3">Parameter</th>
                    <th className="text-left text-gray-500 font-medium px-6 py-3">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {CONNECTION.map((row, i) => (
                    <tr key={row.param} className={i < CONNECTION.length - 1 ? 'border-b border-gray-800' : ''}>
                      <td className="px-6 py-3 text-gray-400 font-medium">{row.param}</td>
                      <td className="px-6 py-3 text-white font-mono">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Username format */}
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-3">Username Format</h3>
              <p className="text-gray-400 text-sm mb-3">ProxyToro uses a structured username to embed targeting options:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  ['username-country-us', 'United States residential'],
                  ['username-country-gb', 'United Kingdom residential'],
                  ['username-country-de', 'Germany residential'],
                  ['username-country-jp', 'Japan residential'],
                ].map(([code, label]) => (
                  <div key={code} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                    <code className="text-purple-400 font-mono text-sm">{code}</code>
                    <span className="text-gray-500 text-sm">→ {label}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3">Replace the country code with any of our available GEO locations.</p>
            </div>

            {/* Example string */}
            <div className="mt-5">
              <p className="text-gray-400 text-sm mb-2">Example connection string:</p>
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm text-purple-300 break-all">
                http://username-country-us:password@gate.proxytoro.com:8080
              </div>
            </div>
          </div>

          {/* Browser tabs */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-5">Browser Setup Guides</h2>

            {/* Tab bar */}
            <div className="flex gap-2 flex-wrap mb-8">
              {browsers.map(b => (
                <button
                  key={b.id}
                  onClick={() => setActiveTab(b.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === b.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>

            {/* Active browser content */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-1">{browser.name}</h3>
              <p className="text-gray-400 text-sm mb-8">{browser.desc}</p>

              {/* Steps */}
              <div className="space-y-3 mb-8">
                {browser.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 bg-gray-950 border border-gray-800 rounded-xl px-5 py-4">
                    <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">{step.title}</p>
                      <p className="text-gray-400 text-sm">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra section (e.g. bulk setup) */}
              {browser.extra && (
                <div className="mb-8">
                  <h4 className="text-white font-semibold mb-2">{browser.extra.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{browser.extra.body}</p>
                  <pre className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-purple-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                    {browser.extra.code}
                  </pre>
                </div>
              )}

              {/* Proxy string */}
              <div className="mb-8">
                <h4 className="text-white font-semibold mb-2">Proxy String Format</h4>
                <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm text-purple-300 break-all">
                  http://username-country-us:password@gate.proxytoro.com:8080
                </div>
              </div>

              {/* Troubleshooting */}
              <div>
                <h4 className="text-white font-semibold mb-3">Troubleshooting</h4>
                <ul className="space-y-2">
                  {browser.troubleshooting.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-purple-400 mt-0.5 shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Need help CTA */}
          <div className="mt-10 bg-purple-600/10 border border-purple-500/20 rounded-2xl px-6 py-8 text-center">
            <h3 className="text-white font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-gray-400 text-sm mb-5">
              If you run into any issue not covered in this guide, our support team is ready to help.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
            >
              Contact Support
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
