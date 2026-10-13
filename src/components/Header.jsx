import { useEffect, useState } from 'react'
import { navigation, siteConfig } from '../data/siteConfig'
import { BrandMark, Button } from './UI'

export default function Header({ menuOpen, onMenuToggle }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && menuOpen) onMenuToggle(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen, onMenuToggle])

  const closeMenu = () => onMenuToggle(false)
  return <>
    <header className={`site-header ${menuOpen ? 'site-header--menu-open' : ''}`}>
      <a className="site-header__logo" href="#top" aria-label={`${siteConfig.brand.shortName} home`}><BrandMark light={!menuOpen} /></a>
      <nav className="site-header__nav" aria-label="Main navigation">
        {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </nav>
      <div className="site-header__actions">
        <a className="site-header__phone" href={siteConfig.brand.phoneHref} target="_blank" rel="noreferrer">WhatsApp</a>
        <Button href="#reservation" variant="primary">Book a table</Button>
        <button className="menu-toggle" type="button" onClick={() => onMenuToggle(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu"><span /><span /><span /><b>{menuOpen ? 'Close' : 'Menu'}</b></button>
      </div>
    </header>
    <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} role="dialog" aria-label={`${siteConfig.brand.shortName} menu`}>
      <div className="mobile-menu__backdrop" onClick={closeMenu} />
      <div className="mobile-menu__content">
        <p className="eyebrow">{siteConfig.brand.shortName} · {siteConfig.brand.cityName}</p>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => <a key={item.href} href={item.href} onClick={closeMenu}><span>0{index + 1}</span>{item.label}</a>)}
        </nav>
        <a className="mobile-menu__contact" href={siteConfig.brand.phoneHref} onClick={closeMenu}>{siteConfig.brand.phone}</a>
      </div>
    </div>
  </>
}
