import { useRef, useEffect } from 'react'

export default function OTPInput({ value, onChange, onComplete }) {
  const inputs = useRef([])

  // Auto-focus first box when component appears
  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return

    const digits = value.split('')
    digits[i] = val[val.length - 1]
    const newValue = digits.join('')
    onChange(newValue)

    if (i < 5) {
      inputs.current[i + 1]?.focus()
    }

    // Auto submit — pass the completed code directly (don't rely on state)
    if (newValue.length === 6 && onComplete) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const digits = value.split('')
      digits[i] = ''
      onChange(digits.join(''))
      if (i > 0) inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    if (pasted.length === 6 && onComplete) onComplete(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-mono font-bold bg-gray-800 border-2 border-gray-700 text-white rounded-xl focus:outline-none focus:border-purple-500 transition"
        />
      ))}
    </div>
  )
}
