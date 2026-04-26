import { useState, useEffect } from 'react'
import './App.css'
import { useSettings } from './useSettings'
import SettingsPanel from './SettingsPanel'
import Socials from './Socials'

export default function App() {
  const { settings, updateSetting, resetSettings, isDeployed } = useSettings()
  const [mode, setMode] = useState('email')
  const [previewMode, setPreviewMode] = useState('desktop')

  const hasEmail = !!(settings.email && settings.email.trim())
  const hasPhone = !!(settings.phone && settings.phone.trim())
  const showToggle = hasEmail && hasPhone
  const effectiveMode = !hasPhone ? 'email' : !hasEmail ? 'phone' : mode
  const isPhone = effectiveMode === 'phone'
  const contactHref = isPhone ? `tel:${settings.phone}` : `mailto:${settings.email}`
  const contactDetail = isPhone ? settings.phone : settings.email

  // Load Google Fonts dynamically based on settings
  useEffect(() => {
    const fonts = [settings.headingFont, settings.bodyFont]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(f => f.replace(/ /g, '+') + ':wght@300;400;500;600;700')
      .join('&family=')

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`
    document.head.appendChild(link)

    return () => { document.head.removeChild(link) }
  }, [settings.headingFont, settings.bodyFont])

  // Apply CSS variables for live theming
  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--heading-font', `'${settings.headingFont}', serif`)
    r.setProperty('--body-font', `'${settings.bodyFont}', sans-serif`)
    r.setProperty('--bg-color', settings.bgColor)
    r.setProperty('--blob-speed', settings.animationSpeed ?? 1)
  }, [settings])

  // Dark theme class on root
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', !!settings.darkMode)
  }, [settings.darkMode])

  // Background animation on/off
  useEffect(() => {
    document.documentElement.classList.toggle('no-bg-animation', settings.animationEnabled === false)
  }, [settings.animationEnabled])

  // Preview mode body class
  useEffect(() => {
    document.body.classList.remove('preview-tablet', 'preview-mobile')
    if (previewMode === 'tablet') document.body.classList.add('preview-tablet')
    if (previewMode === 'mobile') document.body.classList.add('preview-mobile')
  }, [previewMode])

  // SEO — update document title and meta description
  useEffect(() => {
    if (settings.seoTitle) document.title = settings.seoTitle
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = settings.seoDescription || ''
  }, [settings.seoTitle, settings.seoDescription])

  const photoFrameStyle = (() => {
    const shape = settings.photoShape || 'pill'
    const base = shape === 'circle' ? { width: 190, height: 190, borderRadius: '50%' }
      : shape === 'square' ? { width: 190, height: 190, borderRadius: '8px' }
      : {}
    const mode = settings.photoBgMode || 'default'
    const bg = mode === 'transparent' ? 'transparent'
      : mode === 'solid' ? (settings.photoBgColor || '#ffffff')
      : mode === 'match' ? (settings.bgColor || 'transparent')
      : null
    return bg !== null ? { ...base, background: bg } : base
  })()

  const photoImgBg = (() => {
    const mode = settings.photoBgMode || 'default'
    if (mode === 'transparent') return 'transparent'
    if (mode === 'solid') return settings.photoBgColor || '#ffffff'
    if (mode === 'match') return settings.bgColor || 'transparent'
    return null
  })()

  const buttonStyle = {
    background: settings.buttonBgColor,
    color: settings.buttonTextColor,
    borderColor: settings.buttonBorderColor,
  }

  return (
    <>
      <div className="bg">
        <div className="blob blob-1" style={{ background: `radial-gradient(circle, ${settings.blobColor1}, ${settings.blobColor1}aa)` }} />
        <div className="blob blob-2" style={{ background: `radial-gradient(circle, ${settings.blobColor2}, ${settings.blobColor2}aa)` }} />
        <div className="blob blob-3" style={{ background: `radial-gradient(circle, ${settings.blobColor3}, ${settings.blobColor3}aa)` }} />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="nav-links">
            {(settings.navLinks || []).map((link, i) => (
              link.url && link.label ? (
                <a key={i} href={link.url} className="nav-link" style={buttonStyle} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ) : null
            ))}
          </div>
          <Socials settings={settings} />
        </div>

        <div className="main">
          <div className="left">
            <div className="photo-frame" style={photoFrameStyle}>
              {settings.photo
                ? <img
                    src={settings.photo}
                    alt={settings.name}
                    draggable="false"
                    style={{
                      transform: `translate(${settings.photoPosX ?? 0}%, ${settings.photoPosY ?? 0}%) scale(${settings.photoZoom ?? 1})`,
                      ...(photoImgBg !== null && { background: photoImgBg }),
                      ...(settings.photoFadeEdges > 0 && {
                        WebkitMaskImage: `radial-gradient(ellipse at center, black ${100 - settings.photoFadeEdges}%, transparent 100%)`,
                        maskImage: `radial-gradient(ellipse at center, black ${100 - settings.photoFadeEdges}%, transparent 100%)`,
                      }),
                    }}
                  />
                : <div className="photo-placeholder" />}
            </div>
            <p className="name">{settings.name}</p>
            <p className="role">{settings.role}</p>
          </div>

          <div className="right">
            <h1 className="about-title">{settings.aboutTitle}</h1>
            <p className="about-text">
              {settings.aboutText.split('\n\n').map((para, i, arr) => (
                <span key={i}>
                  {para}
                  {i < arr.length - 1 && <><br /><br /></>}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="footer-row">
          <div className="footer-left">
            {showToggle ? (
              <div className="toggle">
                <div className={`toggle-slider ${isPhone ? 'slider-right' : ''}`} />
                <button
                  className={`toggle-option ${!isPhone ? 'active' : ''}`}
                  onClick={() => setMode('email')}
                >
                  ✉ Email
                </button>
                <button
                  className={`toggle-option ${isPhone ? 'active' : ''}`}
                  onClick={() => setMode('phone')}
                >
                  ☎ Call
                </button>
              </div>
            ) : (hasEmail || hasPhone) ? (
              <div className="contact-pill-single">
                {isPhone ? '☎ Call' : '✉ Email'}
              </div>
            ) : null}
            {(hasEmail || hasPhone) && (
              <a className="contact-link" href={contactHref}>{contactDetail}</a>
            )}
          </div>

          <div className="footer-right">
            {settings.showResume && (
              <a className="btn" href={settings.resumeUrl} target="_blank" rel="noreferrer" style={buttonStyle}>Resume</a>
            )}
            {settings.showLinkedin && (
              <a className="btn" href={settings.linkedinUrl} target="_blank" rel="noreferrer" style={buttonStyle}>LinkedIn</a>
            )}
          </div>
        </div>
      </div>

      {!isDeployed && (
        <SettingsPanel
          settings={settings}
          updateSetting={updateSetting}
          resetSettings={resetSettings}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />
      )}
    </>
  )
}
