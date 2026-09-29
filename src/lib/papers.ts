/**
 * The papers page's entries, shared with the sitemap so the page's last-modified
 * date is the newest paper's rather than the build's.
 */

export interface Paper {
  title: string
  authors: string
  venue: string
  date: string
  description: string
  href: string
  cta: string
}

export const papers: Paper[] = [
  {
    title:
      'Spoken-Digit Recognition Without Training: Geometry, Coupling, and Drive Effects in Oscillator Networks',
    authors: 'Eric Kryski',
    venue: 'Under review at ICLR 2027 · September 2026',
    date: '2026-09-25',
    description:
      'An untrained network of 1,024 coupled oscillators, read by a linear readout, set against its own input, the same network uncoupled, leaky-integrator banks and five trained networks of the same size on noisy spoken digits from held-out speakers. Across eight experiments and 6,353 runs, most of the accuracy comes from the input and the readout: the dynamics add memory, a free oscillator amplitude is the one design choice that moves accuracy by more than a point, and neither the lattice geometry, a cochlea included, nor the phase coupling function does.',
    href: 'https://github.com/ekryski/oscillator-research/blob/main/papers/02-untrained-reservoirs/spoken-digit-recognition-without-training-iclr.pdf',
    cta: 'Read the PDF on GitHub',
  },
  {
    title:
      'From Synchronization Physics to Trained Dynamics: A Survey of Oscillator Networks in Machine Learning',
    authors: 'Eric Kryski',
    venue: 'SSRN Working Paper, September 2026',
    date: '2026-09-01',
    description:
      'A survey of coupled-oscillator networks as a machine-learning substrate, organizing eighteen published oscillatory neural network systems around whether gradients reach the oscillator dynamics and how a model is trained around them. Argues that a substrate whose native operations are resonance and entrainment resembles how neurons evolved to sense physical signals, and closes with open directions for shared data, model evaluation, and controls.',
    href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7445198',
    cta: 'Read on SSRN',
  },
  {
    title:
      'Emotive Expression through the Movement of Interactive Robotic Vehicles',
    authors: 'Eric Kryski, Ehud Sharlin',
    venue: 'INTERACT 2011 · LNCS vol. 6948 · Springer',
    date: '2011-01-01',
    description:
      'Design of interactive personal vehicles that express behavioral, personality-like traits through motion to make commuting more satisfying. Presents the design goals, the evolution of the vehicle prototypes, and preliminary findings from a design critique evaluation.',
    href: 'https://link.springer.com/chapter/10.1007/978-3-642-23765-2_7',
    cta: 'Read on Springer',
  },
]
