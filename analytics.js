(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-2Z6BSHCB9F';
  const CONSENT_KEY = 'gbAnalyticsConsent';
  let gaLoaded = false;

  function getLang() {
    try {
      const stored = localStorage.getItem('gbLang');
      if (['en','fr','de'].includes(stored)) return stored;
    } catch (e) {}
    const htmlLang = (document.documentElement.lang || 'en').slice(0,2).toLowerCase();
    return ['en','fr','de'].includes(htmlLang) ? htmlLang : 'en';
  }

  const copy = {
    en: {
      text: 'This site uses Google Analytics only with your consent to understand visits and interactions. No advertising tracking is used.',
      accept: 'Accept analytics',
      decline: 'Essential only',
      privacy: 'Privacy',
      settings: 'Privacy settings'
    },
    fr: {
      text: 'Ce site utilise Google Analytics uniquement avec votre consentement afin de comprendre les visites et interactions. Aucun suivi publicitaire n’est utilisé.',
      accept: 'Accepter les analytics',
      decline: 'Essentiel uniquement',
      privacy: 'Confidentialité',
      settings: 'Préférences de confidentialité'
    },
    de: {
      text: 'Diese Website verwendet Google Analytics nur mit Ihrer Einwilligung, um Besuche und Interaktionen zu verstehen. Es wird kein Werbetracking eingesetzt.',
      accept: 'Analytics zulassen',
      decline: 'Nur erforderlich',
      privacy: 'Datenschutz',
      settings: 'Datenschutz-Einstellungen'
    }
  };

  function injectStyles() {
    if (document.getElementById('gb-analytics-styles')) return;
    const style = document.createElement('style');
    style.id = 'gb-analytics-styles';
    style.textContent = `
      #gb-consent{position:fixed;z-index:99999;left:18px;right:18px;bottom:18px;margin:auto;max-width:840px;background:rgba(16,24,32,.97);color:#f7f4ee;border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 22px 70px rgba(0,0,0,.28);padding:16px 18px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}
      #gb-consent p{margin:0;font-size:12px;line-height:1.55;color:rgba(247,244,238,.78)}
      #gb-consent a{color:#fff;text-decoration:underline;text-underline-offset:3px}
      #gb-consent .gb-consent-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      #gb-consent button{border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:10px 14px;background:transparent;color:#fff;font:700 10px/1 Inter,Arial,sans-serif;letter-spacing:.02em;cursor:pointer;white-space:nowrap}
      #gb-consent button[data-choice="accept"]{background:#f3f0ea;color:#101820;border-color:#f3f0ea}
      #gb-consent button:hover{transform:translateY(-1px)}
      .analytics-settings-link{border:0;background:none;padding:0;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
      @media(max-width:680px){#gb-consent{grid-template-columns:1fr;bottom:10px;left:10px;right:10px}.gb-consent-actions{justify-content:flex-start!important}}
    `;
    document.head.appendChild(style);
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(';').map(c => c.trim().split('=')[0]).forEach(name => {
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.guybeaho.com; SameSite=Lax`;
      }
    });
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(s);
  }

  function track(name, params = {}) {
    if (!gaLoaded || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      ...params,
      page_path: location.pathname + location.search + location.hash,
      transport_type: 'beacon'
    });
  }

  function eventForLink(a) {
    const href = a.getAttribute('href') || '';
    const url = href.toLowerCase();
    if (a.hasAttribute('data-booking-link') || url.includes('calendar.app.google')) return ['booking_click', {}];
    if (url.includes('request-cv.html')) return ['request_cv_click', {}];
    if (url.includes('contact.html') || url.startsWith('mailto:')) return ['contact_click', {}];
    if (url.includes('linkedin.com/in/guybeaho')) return ['linkedin_click', {}];
    if (url.includes('lunebeauty.de')) return ['venture_click', {venture:'lune_beauty'}];
    if (url.includes('project-sum-b961a.web.app')) return ['venture_click', {venture:'lifeos'}];
    if (url.includes('guy2b.github.io/d2l')) return ['venture_click', {venture:'chroniques_dailleurs'}];
    if (url.includes('spacetime-lab.html')) return ['venture_click', {venture:'spacetime_lab'}];
    return null;
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const settings = e.target.closest('[data-analytics-settings]');
      if (settings) {
        e.preventDefault();
        showConsent(true);
        track('privacy_settings_open');
        return;
      }

      const langBtn = e.target.closest('[data-lang]');
      if (langBtn?.dataset?.lang) track('language_change', {language: langBtn.dataset.lang});

      const sim = e.target.closest('[data-open-simulation]');
      if (sim) track('simulation_launch');

      const a = e.target.closest('a');
      if (!a) return;

      if (a.id === 'mailApp' || a.id === 'gmail' || a.id === 'outlook') {
        const page = location.pathname.includes('request-cv') ? 'cv' : 'contact';
        track(page === 'cv' ? 'cv_provider_click' : 'contact_provider_click', {provider: a.id});
      }

      const mapped = eventForLink(a);
      if (mapped) track(mapped[0], mapped[1]);
    }, {capture:true});
  }

  function removeBanner() {
    document.getElementById('gb-consent')?.remove();
  }

  function showConsent(force = false) {
    injectStyles();
    removeBanner();
    const current = getConsent();
    if (!force && (current === 'granted' || current === 'denied')) return;

    const lang = getLang();
    const c = copy[lang];
    const el = document.createElement('aside');
    el.id = 'gb-consent';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-label', c.settings);
    el.innerHTML = `
      <p>${c.text} <a href="privacy.html">${c.privacy}</a></p>
      <div class="gb-consent-actions">
        <button type="button" data-choice="decline">${c.decline}</button>
        <button type="button" data-choice="accept">${c.accept}</button>
      </div>`;
    el.addEventListener('click', (e) => {
      const choice = e.target.closest('button[data-choice]')?.dataset.choice;
      if (!choice) return;
      if (choice === 'accept') {
        setConsent('granted');
        loadGoogleAnalytics();
        track('analytics_consent', {choice:'granted'});
      } else {
        setConsent('denied');
        deleteAnalyticsCookies();
      }
      removeBanner();
    });
    document.body.appendChild(el);
  }

  function addSettingsLinks() {
    injectStyles();
    document.querySelectorAll('[data-analytics-settings]').forEach(btn => {
      if (!btn.textContent.trim()) btn.textContent = copy[getLang()].settings;
    });
  }

  function init() {
    injectStyles();
    addSettingsLinks();
    bindEvents();
    const consent = getConsent();
    if (consent === 'granted') loadGoogleAnalytics();
    if (!consent) showConsent();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
