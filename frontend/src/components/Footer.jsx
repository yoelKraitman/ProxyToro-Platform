const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Pricing',      href: '/#pricing' },
      { label: 'Features',     href: '#' },
      { label: 'Integrations', href: '/#integration' },
      { label: 'Use Cases',    href: '/use-cases' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',          href: '#' },
      { label: 'Contact Sales',     href: '/contact' },
      { label: 'Referral Program',  href: '#' },
      { label: 'Blog',              href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy',  href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy',   href: '#' },
      { label: 'GDPR',            href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center',    href: '#' },
      { label: 'Documentation',  href: '#' },
      { label: 'Status',         href: '#' },
    ],
  },
]

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-8">
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* Top row: brand (full width on mobile) + 2-col link grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Brand — spans both columns on mobile, 1 col on desktop */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 border-2 border-gray-500 rounded-md flex items-center justify-center text-xs text-gray-400 font-bold">
                PT
              </div>
              <span className="text-white font-bold text-lg">ProxyToro</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium proxy solutions for businesses and developers. Fast, reliable, and secure.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://t.me/Proxytoro" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="Telegram">
                <TelegramIcon />
              </a>
              <a href="https://wa.me/message/LIKTP5SBHFJFB1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href="mailto:support@proxytoro.com" className="text-gray-400 hover:text-purple-400 transition" aria-label="Email">
                <EmailIcon />
              </a>
              <a href="https://wa.me/message/LIKTP5SBHFJFB1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition" aria-label="Phone">
                <PhoneIcon />
              </a>
            </div>
          </div>

          {/* Link columns — 2 per row on mobile, 4 across on desktop */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="text-gray-400 hover:text-white text-sm transition">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-sm">
          <p>© 2026 ProxyToro. All rights reserved.</p>
          <p>Built for speed, privacy, and scale.</p>
        </div>

      </div>
    </footer>
  )
}
