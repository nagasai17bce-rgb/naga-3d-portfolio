import { useEffect, useState } from 'react';
import Scene from './components/Scene';
import { experience, profile, projects, skills } from './data/content';

const sections = ['hero', 'experience', 'work', 'contact'];

export default function App() {
  const [active, setActive] = useState('hero');
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      setProgress(window.scrollY / max);
      let current = 'hero';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY + window.innerHeight * .38 >= el.offsetTop) current = id;
      }
      setActive(current);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return <>
    <Scene />
    <div className="progress"><span style={{ transform: `scaleX(${progress})` }} /></div>
    <header className="nav">
      <a className="brand" href="#hero"><span>NS</span><i>.</i></a>
      <div className="nav-links">{sections.map((id, i) => <a className={active === id ? 'on' : ''} href={`#${id}`} key={id}><span>0{i}</span>{id === 'hero' ? 'home' : id}</a>)}</div>
      <a className="status" href="#contact"><span /> available for select projects</a>
    </header>

    <main>
      <section id="hero" className="hero page-section">
        <div className="hero-copy">
          <div className="eyebrow"><span /> MTS · AI / BACKEND ENGINEER · INDIA</div>
          <h1>I build <em>intelligence</em><br />that ships.</h1>
          <p className="hero-lede">AI systems, backend platforms and voice-first experiences built from prototype to production.</p>
          <div className="hero-meta"><span>5+ years engineering</span><b>·</b><span>AI · backend · cloud</span></div>
          <div className="actions"><a className="primary" href="#work">Explore the system <span>↘</span></a><a className="secondary" href="#contact">Let's build something</a></div>
          <div className="hero-pills"><span>LLM</span><span>RAG</span><span>MCP</span><span>VOICE AI</span></div>
        </div>
        <div className="hero-aside"><div className="orb-caption">01 — THE SYSTEM</div><div className="orb-note">A living map of people, models, data and products — with the camera moving as you move through the story.</div></div>
        <div className="scroll-cue"><span className="mouse" /><span>scroll to explore</span></div>
      </section>

      <section id="experience" className="section page-section"><div className="section-glow" />
        <div className="section-head"><div className="label">01 / EXPERIENCE</div><div className="section-kicker">Production systems · AI workflows · cloud</div></div>
        <div className="split-title"><h2>Built across the<br /><em>full stack of reality.</em></h2><p>Scroll through the career path while the 3D system shifts around you.</p></div>
        <div className="timeline">{experience.map((e, i) => <article key={e.company} className="timeline-row">
          <div className="timeline-index">0{i + 1}<span /></div><div className="timeline-main"><div className="timeline-top"><small>{e.year}</small><span>{e.company}</span></div><h3>{e.role}</h3><p>{e.text}</p><div className="mini-tags">{e.tags?.map((t: string) => <b key={t}>{t}</b>)}</div></div>
        </article>)}</div>
      </section>

      <section id="work" className="section page-section work"><div className="section-glow violet" />
        <div className="section-head"><div className="label">02 / SELECTED WORK</div><div className="section-kicker">Interactive system cards</div></div>
        <div className="split-title"><h2>From <em>messy</em> problems<br />to working systems.</h2><p>Click a project to open its system view.</p></div>
        <div className="project-grid">{projects.map((p, i) => <button className={`project-card card-${i + 1}`} key={p.title} onClick={() => setSelected(i)}>
          <div className="project-orbit"><span>{String(i + 1).padStart(2, '0')}</span><i>{p.tag}</i></div><div><h3>{p.title}</h3><p>{p.text}</p></div><div className="project-bottom"><span>{p.stack}</span><i>↗</i></div>
        </button>)}</div>
        <div className="stack-block"><span>CORE STACK</span><div>{skills.map(s => <b key={s}>{s}</b>)}</div></div>
      </section>

      <section className="systems-section page-section"><div className="section-head"><div className="label">03 / AI SYSTEM MAP</div><div className="section-kicker">How the pieces connect</div></div>
        <div className="systems-grid"><div className="system-copy"><h2>Models are only one layer.</h2><p>I connect models to retrieval, tools, data, APIs and the operational systems that make AI useful.</p><div className="system-path"><span>INPUT</span><b>→</b><span>RAG</span><b>→</b><span>LLM</span><b>→</b><span>MCP / TOOLS</span><b>→</b><span>ACTION</span></div></div>
          <div className="node-board">{['LLM','RAG','MCP','VOICE','DATA','APIs','CLOUD','OBSERVE'].map((x, i) => <div className={`tech-node n${i}`} key={x}><span />{x}</div>)}</div></div>
      </section>

      <section id="contact" className="contact page-section"><div className="label">04 / CONTACT</div><div className="contact-grid"><div><h2>Let's turn a<br /><em>hard problem</em><br />into a system.</h2></div><div className="contact-copy"><p>Open to AI engineering, backend systems, product engineering and technology partnerships where the problem is real and the outcome matters.</p><a className="contact-link" href={`mailto:${profile.email}`}>{profile.email} <span>↗</span></a><div className="contact-links"><a href={profile.linkedin}>LinkedIn</a><a href={profile.github}>GitHub</a></div></div></div><footer><span>© {new Date().getFullYear()} {profile.name}</span><span>React · Three.js · TypeScript</span><span>Built for the next system.</span></footer></section>
    </main>

    {selected !== null && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="project-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}>×</button><div className="label">SYSTEM 0{selected + 1}</div><h2>{projects[selected].title}</h2><p>{projects[selected].text}</p><div className="modal-stack">{projects[selected].stack.split(' · ').map(x => <span key={x}>{x}</span>)}</div><div className="modal-flow"><span>Problem</span><b>→</b><span>Architecture</span><b>→</b><span>Production</span></div></div></div>}
  </>;
}
