"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./landing.css";

export default function LandingPage() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    package: "basic",
    message: ""
  });
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    // Observer para animaciones fade-up
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const fadeUps = document.querySelectorAll(".fade-up");
    fadeUps.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setContactForm({
        name: "",
        email: "",
        package: "basic",
        message: ""
      });
    }, 3000);
  };

  return (
    <div className="landing-page-root">
      {/* Selector de idioma */}
      <div className="lang-toggle">
        <button
          type="button"
          className={`lang-btn ${lang === "es" ? "active" : ""}`}
          onClick={() => setLang("es")}
        >
          ES
        </button>
        <button
          type="button"
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
      </div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          Virtual<span>Soul</span>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#how">{lang === "es" ? "Proceso" : "Process"}</a>
          </li>
          <li>
            <a href="#packages">{lang === "es" ? "Paquetes" : "Packages"}</a>
          </li>
          <li>
            <a href="#contact">{lang === "es" ? "Contacto" : "Contact"}</a>
          </li>
          <li>
            <Link
              href="/dashboard/identity"
              className="px-4 py-2 rounded bg-rose-500 hover:bg-rose-600 text-[10px] font-bold text-white tracking-widest uppercase transition-all"
            >
              {lang === "es" ? "Consola App" : "Console App"}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
        <div className="hero">
          <div className="hero-label">
            {lang === "es" ? "AI Influencer Agency — Est. 2026" : "AI Influencer Agency — Est. 2026"}
          </div>
          <h1 className="hero-title">
            <div>{lang === "es" ? "Tu marca." : "Your brand."}</div>
            <div className="line2">{lang === "es" ? "Presencia infinita." : "Infinite presence."}</div>
            <div>
              <span className="accent">{lang === "es" ? "Zero límites." : "Zero limits."}</span>
            </div>
          </h1>
          <p className="hero-sub">
            {lang === "es"
              ? "Construimos avatares de IA hiperrealistas que trabajan por tu marca 24 horas al día, 7 días a la semana. Sin cancelaciones. Sin costos de producción. Sin límites."
              : "We build hyper-realistic AI avatars that work for your brand 24 hours a day, 7 days a week. No cancellations. No production costs. No limits."}
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn-primary">
              <span>{lang === "es" ? "Comenzar ahora" : "Start now"}</span> →
            </a>
            <a href="#packages" className="btn-ghost">
              {lang === "es" ? "Ver paquetes" : "See packages"}
            </a>
          </div>
          <div className="hero-metrics">
            <div className="metric">
              <div className="metric-val">5.8%</div>
              <div className="metric-label">{lang === "es" ? "Engagement avg." : "Engagement avg."}</div>
            </div>
            <div className="metric">
              <div className="metric-val">50%</div>
              <div className="metric-label">{lang === "es" ? "Menor costo" : "Lower cost"}</div>
            </div>
            <div className="metric">
              <div className="metric-val">24/7</div>
              <div className="metric-label">{lang === "es" ? "Disponible" : "Available"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          <span className="marquee-item">{lang === "es" ? "Avatar personalizado" : "Custom avatar"}</span>
          <span className="marquee-item">{lang === "es" ? "Contenido diario" : "Daily content"}</span>
          <span className="marquee-item">{lang === "es" ? "Consistencia garantizada" : "Guaranteed consistency"}</span>
          <span className="marquee-item">{lang === "es" ? "Sin cancelaciones" : "No cancellations"}</span>
          <span className="marquee-item">{lang === "es" ? "Colaboraciones de marca" : "Brand collabs"}</span>
          <span className="marquee-item">Hyper-realistic AI</span>
          <span className="marquee-item">{lang === "es" ? "Avatar personalizado" : "Custom avatar"}</span>
          <span className="marquee-item">{lang === "es" ? "Contenido diario" : "Daily content"}</span>
          <span className="marquee-item">{lang === "es" ? "Consistencia garantizada" : "Guaranteed consistency"}</span>
          <span className="marquee-item">{lang === "es" ? "Sin cancelaciones" : "No cancellations"}</span>
          <span className="marquee-item">{lang === "es" ? "Colaboraciones de marca" : "Brand collabs"}</span>
          <span className="marquee-item">Hyper-realistic AI</span>
        </div>
      </div>

      {/* Process Section */}
      <section id="how" className="landing-section">
        <div className="section-wrap">
          <div className="section-tag fade-up">{lang === "es" ? "El proceso" : "The process"}</div>
          <h2 className="section-title fade-up">
            <span>{lang === "es" ? "De brief a" : "From brief to"}</span> <span>{lang === "es" ? "avatar activo" : "active avatar"}</span>
            <br />
            <span>{lang === "es" ? " en 7 días." : " in 7 days."}</span>
          </h2>
          <div className="how-grid">
            <div className="how-item fade-up">
              <div className="how-num">01 //</div>
              <div className="how-t">{lang === "es" ? "Brief & DNA" : "Brief & DNA"}</div>
              <div className="how-d">
                {lang === "es"
                  ? "Definimos la identidad completa del avatar: rasgos físicos, personalidad, historia, tono de voz. Todo antes de generar la primera imagen."
                  : "We define the complete avatar identity: physical traits, personality, backstory, tone of voice. All before generating the first image."}
              </div>
            </div>
            <div className="how-item fade-up" style={{ transitionDelay: "0.1s" }}>
              <div className="how-num">02 //</div>
              <div className="how-t">{lang === "es" ? "Diseño & Aprobación" : "Design & Approval"}</div>
              <div className="how-d">
                {lang === "es"
                  ? "Generamos 3 opciones de avatar. Eliges, aprobamos, bloqueamos el personaje. Consistencia facial garantizada en cada imagen producida."
                  : "We generate 3 avatar options. You choose, we lock the character. Facial consistency guaranteed in every produced image."}
              </div>
            </div>
            <div className="how-item fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="how-num">03 //</div>
              <div className="how-t">{lang === "es" ? "Producción & Gestión" : "Production & Management"}</div>
              <div className="how-d">
                {lang === "es"
                  ? "Producimos el contenido, gestionamos las cuentas, medimos resultados. Tú apruebas. Nosotros ejecutamos. Sistema en operación desde el día 1."
                  : "We produce content, manage accounts, measure results. You approve. We execute. System in operation from day 1."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="landing-section pkg-section">
        <div className="section-wrap">
          <div className="section-tag fade-up">{lang === "es" ? "Inversión" : "Investment"}</div>
          <h2 className="section-title fade-up">{lang === "es" ? "Elige tu nivel." : "Choose your level."}</h2>
          <div className="pkg-grid">
            <div className="pkg-card fade-up">
              <div className="pkg-name">{lang === "es" ? "Básico" : "Basic"}</div>
              <div
                className="pkg-setup"
                dangerouslySetInnerHTML={{
                  __html: lang === "es" ? "Setup único: <strong>$300</strong>" : "One-time setup: <strong>$300</strong>"
                }}
              ></div>
              <div className="pkg-price">
                <sup>$</sup>500
              </div>
              <div className="pkg-period">
                {lang === "es" ? "/ MES · MÍNIMO 3 MESES" : "/ MONTH · 3 MONTH MIN"}
              </div>
              <div className="pkg-line"></div>
              <ul className="pkg-features">
                <li>{lang === "es" ? "8 posts al mes (2/semana)" : "8 posts/month (2/week)"}</li>
                <li>{lang === "es" ? "4 stories semanales" : "4 weekly stories"}</li>
                <li>{lang === "es" ? "Gestión Instagram completa" : "Full Instagram management"}</li>
                <li>{lang === "es" ? "1 ronda de revisión/post" : "1 revision round/post"}</li>
                <li>{lang === "es" ? "Reporte mensual" : "Monthly report"}</li>
                <li>{lang === "es" ? "Soporte WhatsApp" : "WhatsApp support"}</li>
              </ul>
              <a href="#contact" className="pkg-cta pkg-cta-outline">
                {lang === "es" ? "Comenzar →" : "Get started →"}
              </a>
            </div>

            <div className="pkg-card featured fade-up" style={{ transitionDelay: "0.1s" }}>
              <div className="pkg-badge">{lang === "es" ? "Popular" : "Popular"}</div>
              <div className="pkg-name">{lang === "es" ? "Profesional" : "Professional"}</div>
              <div
                className="pkg-setup"
                dangerouslySetInnerHTML={{
                  __html: lang === "es" ? "Setup único: <strong>$500</strong>" : "One-time setup: <strong>$500</strong>"
                }}
              ></div>
              <div className="pkg-price">
                <sup>$</sup>1,200
              </div>
              <div className="pkg-period">
                {lang === "es" ? "/ MES · MÍNIMO 3 MESES" : "/ MONTH · 3 MONTH MIN"}
              </div>
              <div className="pkg-line"></div>
              <ul className="pkg-features">
                <li>{lang === "es" ? "16 posts al mes (4/semana)" : "16 posts/month (4/week)"}</li>
                <li>{lang === "es" ? "Stories diarias" : "Daily stories"}</li>
                <li>Instagram + TikTok</li>
                <li>{lang === "es" ? "2 contenidos de producto/mes" : "2 product contents/month"}</li>
                <li>{lang === "es" ? "1 Reel animado/mes" : "1 animated Reel/month"}</li>
                <li>{lang === "es" ? "Reporte semanal con métricas" : "Weekly metrics report"}</li>
              </ul>
              <a href="#contact" className="pkg-cta pkg-cta-filled">
                {lang === "es" ? "Comenzar →" : "Get started →"}
              </a>
            </div>

            <div className="pkg-card fade-up" style={{ transitionDelay: "0.2s" }}>
              <div className="pkg-name">Premium</div>
              <div
                className="pkg-setup"
                dangerouslySetInnerHTML={{
                  __html: lang === "es" ? "Setup único: <strong>$800</strong>" : "One-time setup: <strong>$800</strong>"
                }}
              ></div>
              <div className="pkg-price">
                <sup>$</sup>2,500
              </div>
              <div className="pkg-period">
                {lang === "es" ? "/ MES · MÍNIMO 3 MESES" : "/ MONTH · 3 MONTH MIN"}
              </div>
              <div className="pkg-line"></div>
              <ul className="pkg-features">
                <li>{lang === "es" ? "Contenido diario multi-plataforma" : "Daily multi-platform content"}</li>
                <li>{lang === "es" ? "Producto ilimitado" : "Unlimited product content"}</li>
                <li>{lang === "es" ? "Videos animados semanales" : "Weekly animated videos"}</li>
                <li>{lang === "es" ? "Estrategia de crecimiento activa" : "Active growth strategy"}</li>
                <li>{lang === "es" ? "Reportes en tiempo real" : "Real-time reports"}</li>
                <li>{lang === "es" ? "Acceso directo prioritario" : "Priority direct access"}</li>
              </ul>
              <a href="#contact" className="pkg-cta pkg-cta-outline">
                {lang === "es" ? "Comenzar →" : "Get started →"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="landing-section">
        <div className="section-wrap">
          <div className="section-tag fade-up">{lang === "es" ? "Detalles del servicio" : "Service details"}</div>
          <h2 className="section-title fade-up">{lang === "es" ? "Todo lo que incluye." : "Everything included."}</h2>
          <div className="proc-list fade-up">
            <div className="proc-item">
              <div className="proc-num">01 //</div>
              <div>
                <div className="proc-t">{lang === "es" ? "Diseño del personaje" : "Character design"}</div>
                <div className="proc-d">
                  {lang === "es"
                    ? "DNA completo: rasgos físicos, personalidad, historia de origen, tono de voz, comportamiento en cámara. Todo definido y bloqueado antes de producir la primera imagen."
                    : "Full DNA: physical traits, personality, origin story, tone of voice, on-camera behavior. All defined and locked before producing the first image."}
                </div>
              </div>
            </div>
            <div className="proc-item">
              <div className="proc-num">02 //</div>
              <div>
                <div className="proc-t">{lang === "es" ? "Consistencia facial garantizada" : "Guaranteed facial consistency"}</div>
                <div className="proc-d">
                  {lang === "es"
                    ? "Cada imagen mantiene exactamente los mismos rasgos del personaje. Tu avatar es reconocible en cada post, story y video. Sin variaciones, sin sorpresas."
                    : "Every image maintains exactly the same character traits. Your avatar is recognizable in every post, story, and video. No variations, no surprises."}
                </div>
              </div>
            </div>
            <div className="proc-item">
              <div className="proc-num">03 //</div>
              <div>
                <div className="proc-t">{lang === "es" ? "Contenido de producto" : "Product content"}</div>
                <div className="proc-d">
                  {lang === "es"
                    ? "Tu avatar puede sostener y promocionar productos reales de forma creíble. Contenido de colaboración sin costos de producción fotográfica."
                    : "Your avatar can hold and promote real products credibly. Collaboration content without photographic production costs."}
                </div>
              </div>
            </div>
            <div className="proc-item">
              <div className="proc-num">04 //</div>
              <div>
                <div className="proc-t">{lang === "es" ? "Propiedad del contenido" : "Content ownership"}</div>
                <div className="proc-d">
                  {lang === "es"
                    ? "Las imágenes producidas son tuyas. Si cancelas, te llevas todo el contenido generado hasta esa fecha. Contrato mínimo de 3 meses para medir resultados reales."
                    : "Produced images are yours. If you cancel, you keep all content generated to that date. 3-month minimum contract to measure real results."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-section contact-section">
        <div className="section-wrap">
          <div className="section-tag fade-up">{lang === "es" ? "Contacto" : "Contact"}</div>
          <h2 className="section-title fade-up">{lang === "es" ? "Hablemos." : "Let's talk."}</h2>
          <div className="contact-grid fade-up">
            <div className="contact-info">
              <div>
                <div className="ci-label">{lang === "es" ? "Respuesta en" : "Response time"}</div>
                <div className="ci-value">{lang === "es" ? "Menos de 24 horas" : "Less than 24 hours"}</div>
              </div>
              <div>
                <div className="ci-label">Email</div>
                <div className="ci-value">
                  <a href="mailto:hello@virtualsoulagency.com">hello@virtualsoulagency.com</a>
                </div>
              </div>
              <div>
                <div className="ci-label">Instagram</div>
                <div className="ci-value">
                  <a href="https://instagram.com/milenareyes.ai" target="_blank" rel="noreferrer">
                    @milenareyes.ai
                  </a>
                </div>
              </div>
              <div>
                <div className="ci-label">WhatsApp</div>
                <a href="https://wa.me/1XXXXXXXXXX" className="wa-btn" target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>{lang === "es" ? "Escribir por WhatsApp" : "Message on WhatsApp"}</span>
                </a>
              </div>
            </div>
            <form onSubmit={handleSend} className="cf">
              <div className="cf-row">
                <div className="cf-group">
                  <label className="cf-label">{lang === "es" ? "Nombre" : "Name"}</label>
                  <input
                    className="cf-input"
                    placeholder={lang === "es" ? "Tu nombre" : "Your name"}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="cf-group">
                  <label className="cf-label">Email</label>
                  <input
                    className="cf-input"
                    type="email"
                    placeholder="tu@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="cf-group">
                <label className="cf-label">{lang === "es" ? "Paquete" : "Package"}</label>
                <select
                  className="cf-select"
                  value={contactForm.package}
                  onChange={(e) => setContactForm({ ...contactForm, package: e.target.value })}
                >
                  <option value="basic">
                    {lang === "es" ? "Básico — $300 setup + $500/mes" : "Basic — $300 setup + $500/mo"}
                  </option>
                  <option value="pro">
                    {lang === "es" ? "Profesional — $500 setup + $1,200/mes" : "Professional — $500 setup + $1,200/mo"}
                  </option>
                  <option value="premium">
                    {lang === "es" ? "Premium — $800 setup + $2,500/mes" : "Premium — $800 setup + $2,500/mo"}
                  </option>
                </select>
              </div>
              <div className="cf-group">
                <label className="cf-label">{lang === "es" ? "Mensaje" : "Message"}</label>
                <textarea
                  className="cf-textarea"
                  rows={4}
                  placeholder={lang === "es" ? "Cuéntanos sobre tu marca y objetivos..." : "Tell us about your brand and goals..."}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", background: isSent ? "#1a9e2e" : "" }}
              >
                <span>
                  {isSent
                    ? lang === "es"
                      ? "✓ Enviado"
                      : "✓ Sent"
                    : lang === "es"
                    ? "Enviar mensaje"
                    : "Send message"}
                </span>{" "}
                →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          Virtual<span>Soul</span> Agency
        </div>
        <div className="footer-copy">
          {lang === "es"
            ? "© 2026 VirtualSoul Agency. Todos los derechos reservados."
            : "© 2026 VirtualSoul Agency. All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
