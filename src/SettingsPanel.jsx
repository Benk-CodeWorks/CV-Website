import { useState, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import { FONT_OPTIONS } from './config'

const MIN_WIDTH = 360
const DEFAULT_WIDTH = 420

export default function SettingsPanel({ settings, updateSetting, resetSettings, previewMode, setPreviewMode }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('content')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [width, setWidth] = useState(() => {
    const saved = parseInt(localStorage.getItem('portfolio_panel_width'), 10)
    return Number.isFinite(saved) && saved >= MIN_WIDTH ? saved : DEFAULT_WIDTH
  })
  const dragRef = useRef(null)

  // Persist panel width
  useEffect(() => {
    localStorage.setItem('portfolio_panel_width', String(width))
  }, [width])

  // Drag-to-resize handlers
  function startDrag(e) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = width
    dragRef.current = { startX, startWidth }
    document.body.classList.add('resizing-panel')

    function onMove(ev) {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - ev.clientX
      const maxWidth = Math.min(window.innerWidth - 80, 900)
      const next = Math.max(MIN_WIDTH, Math.min(maxWidth, dragRef.current.startWidth + delta))
      setWidth(next)
    }
    function onUp() {
      dragRef.current = null
      document.body.classList.remove('resizing-panel')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function confirmReset() {
    resetSettings()
    setShowResetConfirm(false)
  }

  function updateNavLink(i, field, value) {
    const next = [...(settings.navLinks || [])]
    next[i] = { ...next[i], [field]: value }
    updateSetting('navLinks', next)
  }
  function addNavLink() {
    updateSetting('navLinks', [...(settings.navLinks || []), { label: '', url: '' }])
  }
  function removeNavLink(i) {
    const next = [...(settings.navLinks || [])]
    next.splice(i, 1)
    updateSetting('navLinks', next)
  }

  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)

  async function downloadSite() {
    setDownloading(true)
    setDownloadError(null)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}template.zip`)
      if (!res.ok) throw new Error(`template missing (${res.status})`)
      const buf = await res.arrayBuffer()
      const zip = await JSZip.loadAsync(buf)

      const indexFile = zip.file('index.html')
      if (!indexFile) throw new Error('template index.html missing')
      const html = await indexFile.async('string')

      // Strip the runtime photo if it's the default bundled asset — the
      // template already includes that file. Only inject when the user uploaded their own.
      const photoIsUploaded = settings.photo && typeof settings.photo === 'string' && settings.photo.startsWith('data:')
      const configForRuntime = { ...settings }
      if (!photoIsUploaded) delete configForRuntime.photo

      const inject = `<script>window.__PORTFOLIO_CONFIG__ = ${JSON.stringify(configForRuntime).replace(/</g, '\\u003c')};</script>`
      const patched = html.replace(/<\/head>/i, `  ${inject}\n  </head>`)
      zip.file('index.html', patched)

      const out = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const url = URL.createObjectURL(out)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-portfolio-site.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setDownloadError(err.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className={`settings-overlay ${open ? 'visible' : ''}`} onClick={() => setOpen(false)} />

      {!open && (
        <button
          className="settings-trigger"
          onClick={() => setOpen(true)}
          aria-label="Open site editor"
        >
          <span className="settings-trigger-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <span className="settings-trigger-text">Edit your site</span>
        </button>
      )}

      <div className={`settings-panel ${open ? 'open' : ''}`} style={{ width }}>
        <div className="panel-resize-handle" onMouseDown={startDrag} aria-hidden="true">
          <span className="panel-resize-grip" />
        </div>

        <div className="settings-header">
          <div>
            <h2>Customize</h2>
            <p>Changes save automatically in your browser.</p>
          </div>
          <button className="panel-close-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="settings-tabs">
          {['content', 'style', 'seo', 'preview', 'deploy'].map(t => (
            <button
              key={t}
              className={`settings-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'seo' ? 'SEO' : t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'content' && (
          <div className="settings-body">
            <Field label="Name" value={settings.name} onChange={v => updateSetting('name', v)} />
            <Field label="Role" value={settings.role} onChange={v => updateSetting('role', v)} />
            <Field label="Email" value={settings.email} onChange={v => updateSetting('email', v)} />
            <Field label="Phone" value={settings.phone} onChange={v => updateSetting('phone', v)} />
            <Field label="About heading" value={settings.aboutTitle} onChange={v => updateSetting('aboutTitle', v)} />
            <Field label="About text" value={settings.aboutText} onChange={v => updateSetting('aboutText', v)} textarea />

            <div className="section-label">Main buttons</div>
            <Toggle label="Show Resume button" value={settings.showResume} onChange={v => updateSetting('showResume', v)} />
            <Field label="Resume URL" value={settings.resumeUrl} onChange={v => updateSetting('resumeUrl', v)} />
            <Toggle label="Show LinkedIn button" value={settings.showLinkedin} onChange={v => updateSetting('showLinkedin', v)} />
            <Field label="LinkedIn URL" value={settings.linkedinUrl} onChange={v => updateSetting('linkedinUrl', v)} />

            <div className="section-label">Social icons (leave blank to hide)</div>
            <Field label="LinkedIn" value={settings.socialLinkedin} onChange={v => updateSetting('socialLinkedin', v)} />
            <Field label="Instagram" value={settings.socialInstagram} onChange={v => updateSetting('socialInstagram', v)} />
            <Field label="Facebook" value={settings.socialFacebook} onChange={v => updateSetting('socialFacebook', v)} />
            <Field label="Twitter / X" value={settings.socialTwitter} onChange={v => updateSetting('socialTwitter', v)} />
            <Field label="GitHub" value={settings.socialGithub} onChange={v => updateSetting('socialGithub', v)} />

            <div className="section-label">Extra nav links / pages</div>
            {(settings.navLinks || []).map((link, i) => (
              <div key={i} className="nav-link-row">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label || ''}
                  onChange={e => updateNavLink(i, 'label', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={link.url || ''}
                  onChange={e => updateNavLink(i, 'url', e.target.value)}
                />
                <button className="ghost-btn small" onClick={() => removeNavLink(i)}>✕</button>
              </div>
            ))}
            <button className="ghost-btn" onClick={addNavLink}>+ Add link</button>
          </div>
        )}

        {tab === 'style' && (
          <div className="settings-body">
            <div className="section-label" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>Theme</div>
            <div className="theme-toggle-row">
              <span className="theme-toggle-label">
                <span className="theme-toggle-icon">{settings.darkMode ? '🌙' : '☀'}</span>
                {settings.darkMode ? 'Dark mode' : 'Light mode'}
              </span>
              <button
                type="button"
                className={`theme-switch ${settings.darkMode ? 'on' : ''}`}
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                aria-label="Toggle dark mode"
              >
                <span className="theme-switch-thumb" />
              </button>
            </div>

            <div className="section-label">Background animation</div>
            <Toggle
              label="Enable animated background"
              value={settings.animationEnabled !== false}
              onChange={v => updateSetting('animationEnabled', v)}
            />
            {settings.animationEnabled !== false && (
              <label className="field" style={{ marginTop: 8 }}>
                <span>Speed — {settings.animationSpeed ?? 1}×</span>
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.25"
                  value={settings.animationSpeed ?? 1}
                  onChange={e => updateSetting('animationSpeed', parseFloat(e.target.value))}
                />
                <div className="slider-labels"><span>Slow</span><span>Fast</span></div>
              </label>
            )}

            <div className="section-label">Photo</div>
            <PhotoUpload settings={settings} updateSetting={updateSetting} />
            <div className="shape-picker">
              {['pill', 'circle', 'square'].map(shape => (
                <button
                  key={shape}
                  className={`shape-opt ${(settings.photoShape || 'pill') === shape ? 'active' : ''}`}
                  onClick={() => updateSetting('photoShape', shape)}
                >
                  <span className={`shape-preview shape-${shape}`} />
                  {shape}
                </button>
              ))}
            </div>

            <label className="field">
              <span>Photo background</span>
              <select
                value={settings.photoBgMode || 'default'}
                onChange={e => updateSetting('photoBgMode', e.target.value)}
              >
                <option value="default">Default</option>
                <option value="transparent">Transparent (for cut-out photos)</option>
                <option value="match">Match page background</option>
                <option value="solid">Solid color</option>
              </select>
            </label>
            {(settings.photoBgMode === 'transparent' || settings.photoBgMode === 'match') && (
              <p className="field-hint" style={{ marginTop: -8 }}>
                Only visible if your photo is a transparent PNG (cut-out style). For regular photos, try "Fade edges" below.
              </p>
            )}
            {settings.photoBgMode === 'solid' && (
              <ColorField
                label="Photo background color"
                value={settings.photoBgColor || '#ffffff'}
                onChange={v => updateSetting('photoBgColor', v)}
              />
            )}

            <label className="field">
              <span>Fade edges — {settings.photoFadeEdges ?? 0}%</span>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={settings.photoFadeEdges ?? 0}
                onChange={e => updateSetting('photoFadeEdges', parseInt(e.target.value, 10))}
              />
              <div className="slider-labels"><span>None</span><span>Soft blend</span></div>
            </label>

            {settings.photo && (
              <PhotoPositioner settings={settings} updateSetting={updateSetting} />
            )}

            <div className="section-label">Fonts</div>
            <label className="field">
              <span>Heading font</span>
              <select
                value={settings.headingFont}
                onChange={e => updateSetting('headingFont', e.target.value)}
              >
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Body font</span>
              <select
                value={settings.bodyFont}
                onChange={e => updateSetting('bodyFont', e.target.value)}
              >
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>

            <div className="section-label">Page colors</div>
            <ColorField label="Background" value={settings.bgColor} onChange={v => updateSetting('bgColor', v)} />
            <ColorField label="Blob color 1" value={settings.blobColor1} onChange={v => updateSetting('blobColor1', v)} />
            <ColorField label="Blob color 2" value={settings.blobColor2} onChange={v => updateSetting('blobColor2', v)} />
            <ColorField label="Blob color 3" value={settings.blobColor3} onChange={v => updateSetting('blobColor3', v)} />

            <div className="section-label">Button colors</div>
            <ColorField label="Button background" value={settings.buttonBgColor} onChange={v => updateSetting('buttonBgColor', v)} />
            <ColorField label="Button text" value={settings.buttonTextColor} onChange={v => updateSetting('buttonTextColor', v)} />
            <ColorField label="Button border" value={settings.buttonBorderColor} onChange={v => updateSetting('buttonBorderColor', v)} />

            <div className="section-label">Social icon color</div>
            <ColorField label="Icon color" value={settings.socialIconColor} onChange={v => updateSetting('socialIconColor', v)} />
          </div>
        )}

        {tab === 'seo' && (
          <div className="settings-body">
            <p className="settings-hint">Optimize how your site appears in Google results and when shared on social media.</p>

            <Field label="Page title" value={settings.seoTitle || ''} onChange={v => updateSetting('seoTitle', v)} />
            <p className="field-hint">Shown in browser tabs and search results. Aim for 50–60 characters.</p>

            <Field label="Meta description" value={settings.seoDescription || ''} onChange={v => updateSetting('seoDescription', v)} textarea />
            <p className="field-hint">A short summary search engines display below your title. Aim for 140–160 characters.</p>

            <div className="seo-preview">
              <div className="seo-preview-label">Search result preview</div>
              <div className="seo-preview-card">
                <div className="seo-preview-url">yoursite.com</div>
                <div className="seo-preview-title">{settings.seoTitle || 'Your page title'}</div>
                <div className="seo-preview-desc">{settings.seoDescription || 'Your meta description will appear here.'}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'preview' && (
          <div className="settings-body">
            <p className="settings-hint">See how your site looks on different screen sizes — without resizing your browser.</p>

            <div className="device-picker">
              {[
                { id: 'desktop', label: 'Desktop', icon: '🖥', size: 'Full width' },
                { id: 'tablet', label: 'Tablet', icon: '📱', size: '768 px' },
                { id: 'mobile', label: 'Mobile', icon: '📱', size: '375 px' },
              ].map(d => (
                <button
                  key={d.id}
                  className={`device-opt ${previewMode === d.id ? 'active' : ''}`}
                  onClick={() => setPreviewMode(d.id)}
                >
                  <span className="device-icon">{d.icon}</span>
                  <span className="device-label">{d.label}</span>
                  <span className="device-size">{d.size}</span>
                </button>
              ))}
            </div>

            <p className="field-hint" style={{ marginTop: 16 }}>
              Tip: keep this tab open while you tweak content and styles to see changes update live in the chosen size.
            </p>
          </div>
        )}

        {tab === 'deploy' && (
          <div className="settings-body deploy-guide">
            <div className="deploy-intro">
              <h3>Ready to go live?</h3>
              <p>Just 3 quick steps. Takes about 5 minutes — no coding needed.</p>
              <div className="deploy-needs">
                <span>✓ A free <a href="https://app.netlify.com/signup" target="_blank" rel="noreferrer">Netlify account</a></span>
              </div>
            </div>

            <Step n={1} title="Download your site">
              <p>Click <strong>Download my site</strong> at the bottom of this panel. You'll get a <code>.zip</code> with your finished website inside.</p>
              <p className="step-hint">Your photo, colors, fonts, and text are all baked in.</p>
            </Step>

            <Step n={2} title="Publish it for free">
              Open <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer">netlify.com/drop</a> and
              drag the downloaded <code>.zip</code> file onto the page.
              <p className="step-hint">Netlify unzips it and gives you a live URL instantly.</p>
            </Step>

            <Step n={3} title="Use your own domain (optional)">
              Got a domain like <code>yourname.com</code>? In Netlify, go to
              <strong> Site configuration → Domain management → Add a domain</strong> and follow the prompts.
              <p className="step-hint">Netlify walks you through the DNS setup and adds free HTTPS automatically.</p>
            </Step>
          </div>
        )}

        <div className="settings-footer">
          {showResetConfirm ? (
            <div className="reset-confirm">
              <p>Reset everything to defaults?</p>
              <div className="reset-confirm-actions">
                <button className="ghost-btn" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                <button className="danger-btn" onClick={confirmReset}>Yes, reset</button>
              </div>
            </div>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => setShowResetConfirm(true)}>Reset all</button>
              <button className="primary-btn primary-btn-fun" onClick={downloadSite} disabled={downloading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{downloading ? 'Packaging…' : 'Download my site'}</span>
              </button>
            </>
          )}
          {downloadError && <p className="download-error">{downloadError}</p>}
        </div>
      </div>
    </>
  )
}

function PhotoUpload({ settings, updateSetting }) {
  const inputRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateSetting('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="photo-upload">
      {settings.photo && (
        <img className="photo-upload-preview" src={settings.photo} alt="preview" />
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button className="ghost-btn" onClick={() => inputRef.current.click()}>
        {settings.photo ? 'Change photo' : 'Upload photo'}
      </button>
    </div>
  )
}

function PhotoPositioner({ settings, updateSetting }) {
  const frameRef = useRef()
  const dragState = useRef(null)

  const x = settings.photoPosX ?? 0
  const y = settings.photoPosY ?? 0
  const zoom = settings.photoZoom ?? 1
  const shape = settings.photoShape || 'pill'

  const previewStyle = (() => {
    if (shape === 'circle') return { width: 130, height: 130, borderRadius: '50%' }
    if (shape === 'square') return { width: 130, height: 130, borderRadius: '8px' }
    return { width: 130, height: 158, borderRadius: '65px 65px 0 0' }
  })()

  function startDrag(e) {
    e.preventDefault()
    const rect = frameRef.current.getBoundingClientRect()
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: x,
      origY: y,
      width: rect.width,
      height: rect.height,
    }

    function onMove(ev) {
      const d = dragState.current
      if (!d) return
      const dxPct = ((ev.clientX - d.startX) / d.width) * 100
      const dyPct = ((ev.clientY - d.startY) / d.height) * 100
      updateSetting('photoPosX', d.origX + dxPct)
      updateSetting('photoPosY', d.origY + dyPct)
    }
    function onUp() {
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function reset() {
    updateSetting('photoPosX', 0)
    updateSetting('photoPosY', 0)
    updateSetting('photoZoom', 1)
  }

  return (
    <div className="photo-positioner">
      <div className="photo-positioner-label">Drag to reposition</div>
      <div
        className="photo-positioner-frame"
        ref={frameRef}
        onMouseDown={startDrag}
        style={previewStyle}
      >
        <img
          src={settings.photo}
          alt=""
          draggable="false"
          style={{ transform: `translate(${x}%, ${y}%) scale(${zoom})` }}
        />
      </div>
      <label className="field" style={{ marginBottom: 8 }}>
        <span>Zoom — {zoom.toFixed(1)}×</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={e => updateSetting('photoZoom', parseFloat(e.target.value))}
        />
      </label>
      <button className="ghost-btn small photo-positioner-reset" onClick={reset}>
        Reset position
      </button>
    </div>
  )
}

function Field({ label, value, onChange, textarea }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={5} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} />}
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="field color-field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} />
      </div>
    </label>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="toggle-field">
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function Step({ n, title, children }) {
  return (
    <div className="step">
      <div className="step-num">{n}</div>
      <div className="step-body">
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  )
}
