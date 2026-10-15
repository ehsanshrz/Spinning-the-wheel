import { useEffect, useRef, useState } from 'react'

type Language = 'fa' | 'en'

const initialNames = [
  'آرمان',
  'سارا',
  'نیما',
  'نازنین',
  'پارسا',
  'هستی',
  'کیان',
  'رها',
]

const colors = [
  '#e9a94b',
  '#d86d4c',
  '#b8c982',
  '#719b82',
  '#78a5a3',
  '#e8c982',
  '#cc8270',
  '#93aa72',
]

const copy = {
  fa: {
    eyebrow: 'یک انتخاب شیرین و شانسی',
    title: 'نوبت کیه؟',
    description: 'اسم‌ها رو بنویس، بچرخون و بذار شانس انتخاب کنه.',
    people: 'اسم‌ها',
    peopleCount: (count: number) => `${count} نفر`,
    namesHint: 'هر اسم را در یک خط بنویس',
    spin: 'بچرخون!',
    spinning: 'در حال چرخش…',
    winner: 'انتخاب شد!',
    addPlaceholder: 'یک اسم تازه اضافه کن',
    add: 'اضافه کن',
    empty: 'برای شروع، چند اسم اضافه کن.',
    needNames: 'برای چرخاندن، دست‌کم یک اسم لازم است.',
    footer: 'با یک چرخش ساده، تصمیم‌گیری راحت‌تر می‌شود.',
    language: 'English',
  },
  en: {
    eyebrow: 'A little spin of chance',
    title: 'Who’s next?',
    description: 'Add some names, give the wheel a spin, and let chance choose.',
    people: 'Names',
    peopleCount: (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`,
    namesHint: 'Write one name per line',
    spin: 'Spin the wheel',
    spinning: 'Spinning…',
    winner: 'The pick is…',
    addPlaceholder: 'Add a name',
    add: 'Add',
    empty: 'Add a few names to get started.',
    needNames: 'Add at least one name before spinning.',
    footer: 'A little spin makes decisions easier.',
    language: 'فارسی',
  },
} as const

function drawWheel(canvas: HTMLCanvasElement, names: string[]) {
  const context = canvas.getContext('2d')
  if (!context) return

  const size = 720
  const center = size / 2
  const radius = center - 8
  const slice = (Math.PI * 2) / names.length
  canvas.width = size
  canvas.height = size
  context.clearRect(0, 0, size, size)

  names.forEach((name, index) => {
    const start = -Math.PI / 2 + index * slice
    const end = start + slice
    const middle = start + slice / 2

    context.beginPath()
    context.moveTo(center, center)
    context.arc(center, center, radius, start, end)
    context.closePath()
    context.fillStyle = colors[index % colors.length]
    context.fill()
    context.strokeStyle = '#fff9ef'
    context.lineWidth = 5
    context.stroke()

    context.save()
    context.translate(center, center)
    context.rotate(middle)
    context.textAlign = 'right'
    context.textBaseline = 'middle'
    context.fillStyle = '#26392f'
    context.font = `600 ${Math.max(15, Math.min(27, 270 / names.length))}px Tahoma, Arial, sans-serif`
    context.fillText(name.slice(0, 18), radius - 42, 0, radius * 0.52)
    context.restore()
  })
}

export default function App() {
  const [language, setLanguage] = useState<Language>('fa')
  const [names, setNames] = useState(initialNames)
  const [newName, setNewName] = useState('')
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const text = copy[language]

  useEffect(() => {
    if (canvasRef.current && names.length > 0) {
      drawWheel(canvasRef.current, names)
    }
  }, [names])

  useEffect(
    () => () => {
      if (spinTimer.current) clearTimeout(spinTimer.current)
    },
    [],
  )

  function spin() {
    if (spinning) return
    if (names.length === 0) {
      window.alert(text.needNames)
      return
    }

    const winnerIndex = Math.floor(Math.random() * names.length)
    const slice = 360 / names.length
    const winnerCenter = -90 + (winnerIndex + 0.5) * slice
    const remainder =
      ((-90 - winnerCenter - rotationRef.current) % 360 + 360) % 360
    const nextRotation = rotationRef.current + 360 * 5 + remainder
    rotationRef.current = nextRotation
    setWinner('')
    setSpinning(true)
    setRotation(nextRotation)
    spinTimer.current = setTimeout(() => {
      setWinner(names[winnerIndex])
      setSpinning(false)
    }, 5100)
  }

  function addName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    setNames((current) => [...current, name])
    setNewName('')
    setWinner('')
  }

  function updateNames(value: string) {
    setNames(value.split('\n').map((name) => name.trim()).filter(Boolean))
    setWinner('')
  }

  function removeName(index: number) {
    setNames((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setWinner('')
  }

  return (
    <main className="page" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Name wheel home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span>{language === 'fa' ? 'چرخ انتخاب' : 'Name Wheel'}</span>
        </a>
        <button
          className="language-button"
          type="button"
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          aria-label={language === 'fa' ? 'Switch to English' : 'تغییر زبان به فارسی'}
        >
          <span aria-hidden="true">文</span>
          {text.language}
        </button>
      </header>

      <section className="intro">
        <p className="eyebrow"><span />{text.eyebrow}</p>
        <h1>{text.title}</h1>
        <p className="description">{text.description}</p>
      </section>

      <section className="workspace" aria-label={text.title}>
        <div className="wheel-panel">
          <div className="wheel-stage">
            <div className="pointer" aria-hidden="true" />
            <div className={`wheel ${spinning ? 'is-spinning' : ''}`} style={{ transform: `rotate(${rotation}deg)` }}>
              {names.length > 0 ? (
                <canvas
                  ref={canvasRef}
                  className="wheel-canvas"
                  aria-label={names.join(', ')}
                  role="img"
                />
              ) : (
                <div className="empty-wheel">{text.empty}</div>
              )}
            </div>
            <div className="wheel-hub" aria-hidden="true"><span>✳</span></div>
          </div>
          <button className="spin-button" type="button" onClick={spin} disabled={spinning}>
            <span className="spin-icon" aria-hidden="true">{spinning ? '◌' : '↻'}</span>
            {spinning ? text.spinning : text.spin}
          </button>
          {winner && (
            <div className="winner-card" role="status">
              <span>{text.winner}</span>
              <strong>{winner}</strong>
            </div>
          )}
        </div>

        <aside className="names-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{text.people}</p>
              <h2>{text.peopleCount(names.length)}</h2>
            </div>
            <span className="count-badge">{names.length.toString().padStart(2, '0')}</span>
          </div>
          <form className="add-form" onSubmit={addName}>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={text.addPlaceholder}
              aria-label={text.addPlaceholder}
              maxLength={40}
              disabled={spinning}
            />
            <button type="submit" disabled={spinning || !newName.trim()}>{text.add}</button>
          </form>
          <div className="list-heading">
            <span>{text.namesHint}</span>
            <span className="list-dot" aria-hidden="true" />
          </div>
          <textarea
            className="names-input"
            value={names.join('\n')}
            onChange={(event) => updateNames(event.target.value)}
            placeholder={text.empty}
            aria-label={text.namesHint}
            disabled={spinning}
            spellCheck={false}
          />
          <div className="name-chips" aria-label={text.people}>
            {names.map((name, index) => (
              <button
                className="name-chip"
                type="button"
                key={`${name}-${index}`}
                onClick={() => removeName(index)}
                disabled={spinning}
                aria-label={`${name} ×`}
                title={language === 'fa' ? 'حذف اسم' : 'Remove name'}
              >
                <span className="chip-color" style={{ backgroundColor: colors[index % colors.length] }} />
                {name}
                <span className="chip-remove" aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <footer>{text.footer}</footer>
    </main>
  )
}
