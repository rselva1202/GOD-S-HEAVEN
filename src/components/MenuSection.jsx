import { useMemo, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button, SectionHeading } from './UI'

export default function MenuSection({ onReserveItem }) {
  const menuCfg = siteConfig.menu || {}
  const [activeCategory, setActiveCategory] = useState(menuCfg.categories?.[0]?.id || 'seafood')
  const [vegOnly, setVegOnly] = useState(false)

  // Curated imagery for dish preview hover
  const dishImages = {
    'catch-of-the-day': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
    'malabar-prawn-roast': 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=400&q=80',
    'kerala-fish-curry': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    'squid-pepper-fry': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80',
    'appam-stew': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    'kerala-parotta': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
  }

  const filteredItems = useMemo(() => {
    const categoryItems = (menuCfg.items || []).filter(
      (item) => item.category === activeCategory
    )
    if (!vegOnly) return categoryItems
    return categoryItems.filter((item) => item.veg === true)
  }, [menuCfg.items, activeCategory, vegOnly])

  return (
    <section className="menu-section section-sand" id="menu" aria-labelledby="menu-title">
      <div className="page-shell">
        <div className="menu-header">
          {/* Decorative animated gradient drawing line above menu */}
          <div className="menu-decorative-line" aria-hidden="true" data-draw-line />
          <SectionHeading
            eyebrow={`${menuCfg.badge || 'Our Menu'} · North Cliff, Varkala`}
            title={menuCfg.title || 'The Cliff Kitchen Menu.'}
            body={menuCfg.subtitle || 'Fresh Arabian catches, traditional clay pot preparations, and vegetarian delicacies.'}
          />
        </div>

        {/* Controls: Sliding pill category tabs + FLIP animated Veg Only toggle */}
        <div className="menu-controls">
          <div className="menu-tabs" role="tablist" aria-label="Menu categories">
            {(menuCfg.categories || []).map((cat) => (
              <button
                key={cat.id}
                role="tab"
                type="button"
                aria-selected={activeCategory === cat.id}
                className={`menu-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {activeCategory === cat.id && (
                  <span className="menu-tab__pill-bg" aria-hidden="true" />
                )}
                <span className="menu-tab__label">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="menu-filter">
            <button
              type="button"
              id="veg-filter"
              className={`veg-toggle ${vegOnly ? 'is-active' : ''}`}
              onClick={() => setVegOnly((prev) => !prev)}
              aria-pressed={vegOnly}
              aria-label="Toggle vegetarian only items"
            >
              <span className="veg-toggle__track">
                <span className="veg-toggle__knob" />
              </span>
              <span className="veg-toggle__label">
                {vegOnly ? '🌿 Veg Only' : '🌿 Veg Only'}
              </span>
            </button>
          </div>
        </div>

        {/* Menu items grid with stagger transition and dish thumbnails */}
        <div className="menu-grid" key={`${activeCategory}-${vegOnly}`}>
          {filteredItems.length === 0 ? (
            <div className="menu-empty">
              <p>No vegetarian-only items in this category. Browse our <strong>Vegetarian</strong> tab or disable the Veg Only filter.</p>
              <Button variant="outline" onClick={() => { setActiveCategory('vegetarian'); setVegOnly(true) }}>
                Go to Vegetarian tab
              </Button>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <article
                className={`menu-item ${item.highlight ? 'menu-item--highlight' : ''}`}
                key={item.id}
                data-reveal
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Optional House Special badge with gentle shine sweep */}
                {item.highlight && (
                  <div className="menu-item__badge-special">
                    <span className="badge-shine" aria-hidden="true" />
                    ★ HOUSE SPECIAL
                  </div>
                )}

                <div className="menu-item__header">
                  <div className="menu-item__title-wrap">
                    <span
                      className={`menu-item__dot ${item.veg ? 'menu-item__dot--veg' : 'menu-item__dot--nonveg'}`}
                      aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}
                    >
                      <i />
                    </span>
                    <h3 className="menu-item__name">
                      <span className="menu-item__name-text">{item.name}</span>
                    </h3>
                  </div>
                  {/* Subtle shimmer text effect replacing static price */}
                  <span className="menu-item__price price-shimmer">
                    {item.price || 'Price on menu'}
                  </span>
                </div>

                <div className="menu-item__body-wrap">
                  <p className="menu-item__desc">{item.description}</p>
                  {/* Sliding dish thumbnail from the right */}
                  {dishImages[item.id] && (
                    <div className="menu-item__thumb" aria-hidden="true">
                      <img src={dishImages[item.id]} alt="" loading="lazy" />
                    </div>
                  )}
                </div>

                <div className="menu-item__footer">
                  <span className="menu-item__tag">
                    {item.highlight ? 'Local Favourite' : item.veg ? 'Vegetarian' : 'Arabian Sea Catch'}
                  </span>
                  <a
                    href="#reservation"
                    className="menu-item__reserve-link cursor-reserve"
                    onClick={(e) => {
                      e.preventDefault()
                      onReserveItem?.({ notes: `Interested in: ${item.name}` })
                      // Open WhatsApp directly with dish pre-filled
                      const text = encodeURIComponent(`Hello God's Own Country Kitchen, I would like to reserve a table to try your "${item.name}".`)
                      window.open(`https://wa.me/${siteConfig.brand.whatsapp}?text=${text}`, '_blank')
                    }}
                  >
                    <span>Reserve table for this</span>
                    <ArrowIcon />
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="menu-footer">
          <p className="menu-footer__disclaimer">
            * All seafood items are landed fresh daily by Varkala coast fishermen and prepared to order. Special dietary requests and spice adjustments gladly accommodated.
          </p>
          <Button href="#reservation">Reserve a table</Button>
        </div>
      </div>
    </section>
  )
}
