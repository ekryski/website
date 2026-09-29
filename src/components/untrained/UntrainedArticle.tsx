import Image from 'next/image'
import Link from 'next/link'

import { Prose } from '@/components/Prose'
import { ModelConsole } from '@/components/untrained/ModelConsole'

const REPO = 'https://github.com/ekryski/oscillator-research'
const PAPER = `${REPO}/tree/main/papers/02-untrained-reservoirs`
const PDF = `${REPO}/blob/main/papers/02-untrained-reservoirs/spoken-digit-recognition-without-training-iclr.pdf`
const FIRST_POST = '/articles/how-a-machine-hears-a-number'

/** Section headings read as chapter markers; body rhythm is tighter than the site default. */
const TYPE = [
  'prose-lg',
  'prose-headings:tracking-tight',
  'prose-h2:mt-20 prose-h2:mb-6 prose-h2:text-5xl prose-h2:font-extrabold sm:prose-h2:text-6xl',
  'prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-2xl prose-h3:font-bold sm:prose-h3:text-3xl',
  'prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5',
].join(' ')

/** One caption style for every figure: small, grey, justified, slightly inset. */
const CAPTION =
  'mt-4 px-2 text-justify text-[13.5px] leading-relaxed text-zinc-500 sm:px-4 dark:text-zinc-500 ' +
  '[&_b]:font-semibold [&_b]:text-zinc-600 dark:[&_b]:text-zinc-400'

const ext = { target: '_blank', rel: 'noopener noreferrer' }

/**
 * The post itself: markup only, no state. Canvases and controls are driven by
 * src/lib/untrained/post.js, which finds them by id after mount.
 */
export function UntrainedArticle() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────── 01 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">01 · the question</span>What does the physics add?</h2>
        <p>
          In <Link href={FIRST_POST}>How a machine hears a number</Link> I walked from a pressure wave to a
          network of coupled oscillators that could tell <em>“three”</em> from <em>“eight”</em>. The
          oscillators were never trained. Their coupling was drawn at random once and never updated, and only a
          linear readout on top was fitted, and it still read spoken digits at 96%.
        </p>
        <p>
          That number invites an obvious question, and the first post ended on it: how much of it comes from
          the oscillators? A good accuracy can come from at least three places that have nothing to do with
          synchronization physics. The input may already carry most of the answer. The readout may be wide
          enough to find the answer in almost anything. Or the dynamics may genuinely help. The first guide’s
          own fine print showed that the readout alone was worth a lot: squeeze its features through a narrow
          projection and 96.2% fell to 67.3%.
        </p>
        <p>
          The second paper in this research programme,{' '}
          <a href={PDF} {...ext}>Spoken-Digit Recognition Without Training</a>, is built to separate those
          three explanations. It takes a small untrained oscillator network, reads it the same way it reads
          every alternative, and compares it with models that each remove one ingredient: the dynamics
          entirely, the oscillation, the coupling. Then it changes the physics one factor at a time, across
          eight experiments and 6,353 runs.
        </p>
        <p>
          This page explains that study: what each model is, how they were compared, and why the comparisons
          are the ones they are, with what the paper found at the end. Every model at the heart of the paper is
          also running here, in your browser, on real recordings, so you can do the experiment yourself one
          clip at a time.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="diagram">
          <svg viewBox="0 0 1000 250" role="img" aria-label="The shared pipeline: front end, one arm, the read, the readout">
            <defs>
              <marker id="uArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#67718a" />
              </marker>
            </defs>
            <text x="20" y="26" className="hd">FIXED, SHARED</text>
            <text x="330" y="26" className="hd">VARIES BY MODEL</text>
            <text x="690" y="26" className="hd">FIXED, SHARED</text>

            <rect className="bx bxFront" x="20" y="70" width="140" height="110" rx="12" />
            <text x="90" y="104" className="lb" textAnchor="middle">front end</text>
            <text x="90" y="126" className="sub" textAnchor="middle">16 kHz audio</text>
            <text x="90" y="143" className="sub" textAnchor="middle">→ 16 mel bands</text>
            <text x="90" y="160" className="sub" textAnchor="middle">62.5 frames/s</text>

            <rect className="bx" x="190" y="92" width="110" height="66" rx="10" />
            <text x="245" y="120" className="lb" textAnchor="middle">× gain</text>
            <text x="245" y="140" className="sub" textAnchor="middle">band r → row r</text>

            <rect className="bx bxCore" x="330" y="46" width="330" height="158" rx="14" />
            <text x="495" y="76" className="lb" textAnchor="middle">one arm</text>
            <text x="495" y="100" className="sub" textAnchor="middle">nothing (spectrogram-only baseline)</text>
            <text x="495" y="118" className="sub" textAnchor="middle">coupled oscillators · uncoupled oscillators</text>
            <text x="495" y="136" className="sub" textAnchor="middle">leaky integrators (1,024 or 2,048)</text>
            <text x="495" y="154" className="sub" textAnchor="middle">GRU · TCN · CNN · transformer · S4D</text>
            <text x="495" y="182" className="subHot" textAnchor="middle">each exposes its signals over time</text>

            <rect className="bx" x="690" y="70" width="140" height="110" rx="12" />
            <text x="760" y="104" className="lb" textAnchor="middle">the read</text>
            <text x="760" y="126" className="sub" textAnchor="middle">frames 16–61</text>
            <text x="760" y="143" className="sub" textAnchor="middle">4 windows</text>
            <text x="760" y="160" className="sub" textAnchor="middle">mean · SD · |Δ|</text>

            <rect className="bx" x="860" y="70" width="120" height="110" rx="12" />
            <text x="920" y="104" className="lb" textAnchor="middle">readout</text>
            <text x="920" y="126" className="sub" textAnchor="middle">→ 192 features</text>
            <text x="920" y="143" className="sub" textAnchor="middle">ridge, 1,930</text>
            <text x="920" y="160" className="sub" textAnchor="middle">weights · 0–9</text>

            <path className="ln" markerEnd="url(#uArrow)" d="M160 125 H185" />
            <path className="ln" markerEnd="url(#uArrow)" d="M300 125 H325" />
            <path className="ln" markerEnd="url(#uArrow)" d="M660 125 H685" />
            <path className="ln" markerEnd="url(#uArrow)" d="M830 125 H855" />
            <text x="495" y="236" className="sub" textAnchor="middle">
              every model is read by the same function and scored by a readout of the same size
            </text>
          </svg>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 1 · the shared pipeline.</b> The paper’s design in one picture. The front end, the
          way signals are summarized and the readout are identical for every model; only the box in the
          middle changes. The untrained arms have no fitted parameters at all: only the readout’s 1,930
          weights are fitted, so any difference between two arms is a difference in what they did to the
          same input.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 02 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">02 · oscillators</span>Oscillators, coupled and uncoupled</h2>
        <p>
          An oscillator is anything that cycles: a pendulum, a firefly’s flash, a neuron that fires
          rhythmically. The simplest mathematical version (
          <a href="https://en.wikipedia.org/wiki/Kuramoto_model" {...ext}>Kuramoto</a>) keeps a single number,
          its <strong>phase</strong>{' '}
          θ, an angle that advances around a circle. Left alone, it advances at its own{' '}
          <strong>natural frequency</strong> ω. The interesting part is what happens when many of them can
          feel each other.
        </p>
        <p>
          Below are 24 oscillators with different natural frequencies. With the coupling at zero they are an{' '}
          <strong>uncoupled</strong> population: each turns at its own rate, and their phases smear evenly
          around the circle. Turn the coupling up and each one starts to be pulled toward the others. Past a
          threshold, a cluster forms and grows until most of them move together. The white arrow is the{' '}
          <strong>order parameter R</strong>, the average of all their phases taken as unit vectors: near 0
          when they are scattered, near 1 when they are locked.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>24 oscillators, all coupled to all</span>
            <em>R = <b id="ringRVal">—</b></em>
          </div>
          <div className="canvasFrame"><canvas id="ringCanvas" style={{ height: 190 }} /></div>
          <div className="canvasFrame" style={{ marginTop: 8 }}><canvas id="ringR" style={{ height: 60 }} /></div>
          <div className="grid gap-4 sm:grid-cols-3" style={{ marginTop: 12 }}>
            <div className="dial">
              <label htmlFor="ringK">coupling K <b id="ringKVal">1.20</b></label>
              <input className="slider" type="range" id="ringK" min="0" max="300" defaultValue="120" />
            </div>
            <div className="dial">
              <label htmlFor="ringSpread">spread of natural frequencies <b id="ringSpreadVal">0.50</b></label>
              <input className="slider" type="range" id="ringSpread" min="0" max="150" defaultValue="50" />
            </div>
            <div className="dial">
              <label htmlFor="ringLambda">restoring strength λ <b id="ringLambdaVal">0.00</b></label>
              <input className="slider" type="range" id="ringLambda" min="0" max="200" defaultValue="0" />
            </div>
          </div>
          <div className="runRow">
            <button type="button" className="action" id="ringReset">scatter again</button>
            <button type="button" className="action" id="ringUncouple">uncouple (K = 0)</button>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 2 · coupled and uncoupled.</b> Left, each oscillator as a clock hand; right, all 24 phases
          on one circle. Drag the coupling to zero and the population falls apart into independent clocks;
          raise it and they synchronize, faster when their natural frequencies are close together. The{' '}
          <b>restoring strength</b> λ pulls every oscillator toward phase 0: one whose natural frequency is
          below λ stops turning altogether and is held in place, and a faster one keeps turning but unevenly,
          slowed where the pull opposes it. This toy couples every oscillator to every other with the same
          positive weight; the network in the paper does neither, as below.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          Written out, each oscillator i in the paper’s network advances by
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="equation !border-0 !bg-transparent !p-0 !pb-1">
            dθ<sub>i</sub>/dt = <span className="tDrift">ω<sub>i</sub></span>{' + '}
            <span className="tCouple">Σ<sub>j</sub> K<sub>ij</sub> · sin(θ<sub>j</sub> − θ<sub>i</sub>)</span>{' − '}
            <span className="tPin">λ · sin θ<sub>i</sub></span>{' + '}
            <span className="tDrive">g · u<sub>r(i)</sub>(t)</span>
          </div>
          <div className="termGrid">
            <div>
              <span className="tDrift">ω</span>
              <span><b>Natural frequency.</b> Drawn at random from N(1, 0.1²) and then fixed. One step per 16 ms frame with a time step of 0.1 means a free oscillator turns about once a second.</span>
            </div>
            <div>
              <span className="tCouple">K, sin(Δθ)</span>
              <span><b>Coupling.</b> Each oscillator is pulled toward the phases of the others, in proportion to a weight that depends only on their offset on the lattice. This is the Kuramoto coupling function; section 07 swaps it for others.</span>
            </div>
            <div>
              <span className="tPin">λ</span>
              <span><b>Restoring strength.</b> A pull toward phase 0, λ = 0.3. It gives the network a fading memory: what it heard a second ago matters less than what it hears now.</span>
            </div>
            <div>
              <span className="tDrive">g · u</span>
              <span><b>The input.</b> The energy in mel band r, scaled by the input gain g, added to the turning rate of every oscillator in row r. A loud band speeds its row up.</span>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 3 · the whole network, in one line.</b> Integrated with one Euler step per frame. The
          readout never sees θ itself, since 0.01 and 6.27 are neighbours on the circle but far apart as
          numbers; it sees sin θ and cos θ, two signals per oscillator.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>The network under test</h3>
        <p>
          The <strong>coupled oscillator network</strong> is 1,024 of these: four <strong>channels</strong>,
          each a 16 × 16 lattice of 256 oscillators. Row r of every channel is driven by mel band r, lowest at
          the bottom, so the lattice inherits the ear’s layout. Within a channel, every oscillator acts on
          every other through a <strong>coupling kernel</strong>: a 16 × 16 table of weights, one per offset,
          drawn from N(0, 0.05²). A positive weight pulls a pair toward the same phase, a negative one pushes
          them apart. The same table applies at every site, which makes the coupling a convolution. Channels
          do not act on each other: they are four differently drawn copies read side by side, the way a
          convolutional layer’s channels are.
        </p>
        <p>
          One more constant bounds the whole thing. A random kernel can amplify some spatial patterns of phase
          much more than others; the <strong>coupling ceiling</strong> rescales each channel’s kernel so that
          its largest amplification is 1. Random kernels here peak between 1.4 and 2.9, so the ceiling always
          applies, and it sets every channel’s overall coupling strength.
        </p>
        <p>
          That is the entire model: 1,024 natural frequencies and 1,024 kernel weights, 2,048 numbers, all
          drawn once from a seed and never updated. The <strong>uncoupled oscillator network</strong> is the
          same network with every kernel weight set to zero. Each oscillator keeps its natural frequency, its
          restoring pull and its input, and none acts on another, so any difference between the two is what
          the coupling contributes.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 03 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">03 · the control with memory</span>Leaky integrators: memory without oscillation</h2>
        <p>
          An oscillator network driven by sound is, among other things, a bank of filters with memory. Each
          oscillator’s state at any moment depends on what it heard recently, weighted toward the recent past.
          So is a much simpler object, and if the oscillators cannot beat it, their accuracy comes from being
          filters with memory, not from being oscillators.
        </p>
        <p>
          That simpler object is the <strong>leaky integrator</strong>. It holds one number and, every frame,
          moves a fixed fraction of the way toward its input:
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="equation !border-0 !bg-transparent !p-0 !pb-1">
            x ← <span className="tDrift">(1 − a) · x</span>{' + '}
            <span className="tCouple">a</span> · tanh(<span className="tPin">g<sub>in</sub> · g</span> ·{' '}
            <span className="tDrive">u</span>)
          </div>
          <div className="termGrid">
            <div>
              <span className="tDrift">(1 − a) x</span>
              <span><b>What it keeps.</b> Each frame the unit keeps a share 1 − a of its old value; the rest leaks away, so old input fades exponentially.</span>
            </div>
            <div>
              <span className="tCouple">a</span>
              <span><b>Leak rate.</b> Set by the unit’s time constant τ as a = 1 − e<sup>−1/(62.5 τ)</sup>: 0.63 at τ = 16 ms, a unit that forgets within a few frames, down to 0.016 at τ = 1 s, one that averages the whole clip.</span>
            </div>
            <div>
              <span className="tPin">g<sub>in</sub> · g</span>
              <span><b>Gains.</b> The unit’s own input weight, drawn from N(1, 0.1²), times the input gain g that every reservoir shares.</span>
            </div>
            <div>
              <span className="tDrive">u</span>
              <span><b>The input.</b> The energy in the unit’s mel band, the same row value that drives the oscillators. The tanh keeps a loud band from pushing the state past 1.</span>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 4 · a leaky integrator, in one line.</b> In signal-processing terms it is a first-order
          low-pass filter: a running average of its recent input. In reservoir computing it is the unit of a
          leaky echo state network.
        </figcaption>
      </figure>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>one band’s energy through five leaky integrators</span>
          </div>
          <div className="canvasFrame"><canvas id="leakyCanvas" style={{ height: 200 }} /></div>
          <div className="legend" aria-hidden="true">
            <span><i style={{ background: 'rgba(231,234,241,0.55)' }} />input, tanh(g · u)</span>
            <span><i style={{ background: '#ff8a5b' }} />τ 16 ms</span>
            <span><i style={{ background: '#ffd166' }} />45 ms</span>
            <span><i style={{ background: '#6ee7a8' }} />125 ms</span>
            <span><i style={{ background: '#7cc4ff' }} />350 ms</span>
            <span><i style={{ background: '#c4a7ff' }} />1 s</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 12 }}>
            <div className="dial">
              <label htmlFor="leakyBand">mel band <b>low → high</b></label>
              <input className="slider" type="range" id="leakyBand" min="0" max="15" step="1" defaultValue="6"
                     list="leakyBandTicks" />
              <datalist id="leakyBandTicks">
                {Array.from({ length: 16 }, (_, b) => <option value={b} key={b} />)}
              </datalist>
              <div className="bandRange" id="leakyBandRange">band 7 · 1,004 to 1,591 Hz</div>
            </div>
            <div className="field">
              <span>input gain</span>
              <div className="seg" role="group" aria-label="input gain">
                <button type="button" className="segBtn" data-lgain="1">1</button>
                <button type="button" className="segBtn" data-lgain="2">2</button>
                <button type="button" className="segBtn" data-lgain="4">4</button>
              </div>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 5 · fast and slow memories.</b> Time along the bottom, over the selected clip’s one
          second (pick a clip in section 04); each unit’s state x up the side. Grey: the input every unit moves
          toward, tanh(g · u) of one mel band’s energy. Coloured: the states of five leaky integrators fed that
          band, with time constants of 16 ms (orange), 45 ms, 125 ms, 350 ms and 1 s (violet). The slider picks
          the band, and the line under it gives the frequencies that band covers. The fast ones track every syllable; the slow ones
          only know roughly how loud the band has been. Raise the gain and the tanh flattens the peaks. None of
          them can ever do what an oscillator does: turn.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          The <strong>leaky-integrator bank</strong> is 1,024 of these, routed exactly like the oscillator
          network: band r drives every unit in row r of every channel. Its time constants run on one
          log-spaced schedule from one frame (16 ms) to one clip (1 s), laid out so that every band is read at
          every time scale, and its input weights g<sub>in</sub> are drawn from N(1, 0.1²), the distribution
          the network draws its natural frequencies from. Nothing about the schedule was tuned: it is a
          falsification control, not a claim that this is a good design.
        </p>
        <p>
          It comes in two sizes, because the two models expose different numbers of signals. The{' '}
          <strong>state-matched</strong> bank has the network’s 1,024 states and 2,048 parameters, but each
          unit exposes one signal where an oscillator exposes two (sin θ and cos θ). The{' '}
          <strong>width-matched</strong> bank has 2,048 units, matching the 2,048 signals, at twice the
          parameters.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>the state-matched bank’s 1,024 time constants</span>
            <em>orange = fast (16 ms) · violet = slow (1 s)</em>
          </div>
          <div className="canvasFrame"><canvas id="bankLayout" style={{ height: 170 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 6 · every band at every time scale.</b> The bank stored as the network is: four channels
          of 16 × 16, row r fed by mel band r. Within a row, the 64 units run from the fastest (channel 1,
          left) to the slowest (channel 4, right), so each band is integrated over 64 time scales. The colours
          are figure 5’s: orange for 16 ms through violet for 1 s.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 04 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">04 · the front end</span>Sixteen numbers every 16 milliseconds</h2>
        <p>
          Every model starts from the same fixed front end, which turns one second of 16 kHz audio into 61
          frames of 16 numbers. The first post builds it up piece by piece; here it is with the constants the
          paper fixed, and why.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>choose a recording</span>
            <em id="clipMeta">—</em>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="digits" id="clipPicker" />
            <button type="button" className="action primary" id="playBtn">▶ Play</button>
            <span className="tag" id="loadTag">loading…</span>
          </div>
          <div className="feGrid">
            <div>
              <div className="feLabel">waveform · 16,000 samples</div>
              <div className="canvasFrame"><canvas id="feWave" style={{ height: 80 }} /></div>
            </div>
            <div>
              <div className="feLabel">STFT · 512-point, every 256 samples · 257 bins × 61 frames</div>
              <div className="canvasFrame"><canvas id="feStft" style={{ height: 110 }} /></div>
            </div>
            <div>
              <div className="feLabel">16 mel bands, log energy</div>
              <div className="canvasFrame"><canvas id="feMel" style={{ height: 80 }} /></div>
            </div>
            <div className="feRowsGrid">
              <div>
                <div className="feLabel">drive rows: (log + 10) / 10, clamped at 0 · what every arm receives</div>
                <div className="canvasFrame"><canvas id="feRows" style={{ height: 80 }} /></div>
              </div>
              <div>
                <div className="feLabel">now</div>
                <div className="canvasFrame"><canvas id="feNow" style={{ height: 80 }} /></div>
              </div>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 7 · the front end, live.</b> Every clip on this page comes from{' '}
          <a href="https://github.com/soerenab/AudioMNIST" {...ext} className="underline">AudioMNIST</a>, 30,000
          recordings of 60 speakers saying the ten digits. These twenty come from the test speakers (49 to
          60), whom no readout on this page was ever fitted on. Each is stored as the paper’s bank stores it:
          resampled to 16 kHz, its peak set to 0.5, trimmed to the word, and zero-padded to one second.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <table>
          <thead>
            <tr><th>constant</th><th>value</th><th>why</th></tr>
          </thead>
          <tbody>
            <tr><td>sample rate</td><td>16 kHz</td><td>Speech carries little above 8 kHz; one second is 16,000 samples.</td></tr>
            <tr><td>window, hop</td><td>512, 256 samples</td><td>A 32 ms window hopping 16 ms: 62.5 frames a second, 61 per clip. No centre padding, so the frame count is exact.</td></tr>
            <tr><td>mel bands</td><td>16</td><td>One per lattice row, so band r can drive row r directly.</td></tr>
            <tr><td>log</td><td>log(energy + 10⁻⁵)</td><td>Loudness is heard on a log scale; the offset keeps silence finite.</td></tr>
            <tr><td>rescale</td><td>(x + 10) / 10, clamped at 0</td><td>One fixed map into a drive of about 0 (silence) to 1.5 (loud). Nothing is normalized per clip, because a clip’s own statistics are unknown until it ends: a model that has to listen as the sound arrives cannot use them.</td></tr>
            <tr><td>warm-up</td><td>16 frames (256 ms)</td><td>Skipped by the read, so every model is read after its state has settled from the same initial condition. The spectrogram-only baseline, which has no state, is read from frame 0 (section 05).</td></tr>
          </tbody>
        </table>
        <p>
          Nothing in the front end is trained, and nothing depends on the clip. The same arithmetic runs
          here in your browser: the rows you see are identical, to rounding, to the rows the paper’s harness
          computed. The paper measures the effect of one of these constants: in figure 9, read the
          spectrogram-only baseline <em>from frame 0</em> and then with the four windows, which skip the
          warm-up, to see what the first 256 ms of a word are worth on their own.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 05 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">05 · the readout</span>One readout for every model</h2>
        <p>
          If two models are read differently, a difference in their accuracy can come from the readers rather
          than the models. A pilot of this study read its models three different ways, so the paper reads every
          model with exactly one function, in four steps.
        </p>
        <ol>
          <li>
            <strong>Signals.</strong> An arm only says which signals it exposes over time: sin θ and cos θ of
            each oscillator, each leaky integrator’s state, a trained network’s hidden units, or, for the
            spectrogram-only baseline, the 16 band energies themselves.
          </li>
          <li>
            <strong>Statistics.</strong> Over frames 16 to 61, cut into four equal windows, each signal is
            summarized by its mean, its standard deviation and its mean absolute change from frame to frame.
            None of them depends on an endpoint, so no arm can hand the readout its last state.
          </li>
          <li>
            <strong>Projection.</strong> The features are standardized with the training set’s own statistics
            and multiplied by one fixed random Gaussian matrix down to 192, the spectrogram-only baseline’s own
            width. An arm already at or below 192 is read as it is. The matrix is drawn once, from a fixed
            seed, and serves every run of the same native width.
          </li>
          <li>
            <strong>Ridge.</strong> One linear layer from 192 features to ten digit scores, fitted in closed
            form by least squares with an L2 penalty. The penalty is chosen from four values on the last eighth
            of the 2,048 training clips, then the layer is refit on all of them. The highest score wins.
          </li>
        </ol>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>reading the selected clip</span>
            <div className="seg" role="group" aria-label="arm to read">
              <button type="button" className="segBtn" data-rarm="coupled">coupled</button>
              <button type="button" className="segBtn" data-rarm="uncoupled">uncoupled</button>
              <button type="button" className="segBtn" data-rarm="bank-state">leaky bank</button>
              <button type="button" className="segBtn" data-rarm="baseline">spectrogram only</button>
            </div>
          </div>
          <div className="feLabel">1 · six of the arm’s signals over the clip, the warm-up dimmed, the four windows marked</div>
          <div className="canvasFrame"><canvas id="readTraces" style={{ height: 120 }} /></div>
          <div className="feLabel">2 · every statistic of every signal: four windows × mean, SD, change (blue low, orange high)</div>
          <div className="canvasFrame"><canvas id="readFeatures" style={{ height: 26 }} /></div>
          <div className="feLabel">3 · projected to 192</div>
          <div className="canvasFrame"><canvas id="readProjected" style={{ height: 26 }} /></div>
          <div className="feLabel">4 · ten digit scores, 0 at the bottom</div>
          <div className="canvasFrame"><canvas id="readScores" style={{ height: 120 }} /></div>
          <p className="viewNote" id="readCounts" />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 8 · the read, step by step.</b> The selected clip (section 04) through each arm at gain 1
          on clean audio, and through that arm’s fitted readout. The coupled network exposes 2,048 signals, so
          its read is 24,576 numbers before the projection brings it to 192; the spectrogram-only baseline
          exposes 16 and reaches exactly 192 on its own.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>Why these choices</h3>
        <p>
          <strong>The same width for every arm.</strong> A ridge’s capacity grows with the number of features
          it is handed, and the reservoirs expose 12,288 to 24,576 against the input’s 192. So that readout
          capacity cannot pass for dynamics, every arm is read at 192 features: exactly the spectrogram-only
          baseline’s own count (16 bands × 3 statistics × 4 windows), so the input is read without
          compression, and the native width of four of the five trained baselines. The paper also reads every
          model wider: at width 4,096 the reservoirs gain up to about 6 points, but their readout then fits 40,970
          weights against the 1,930 that read the input. Figure 9 shows every width.
        </p>
        <p>
          <strong>One fixed window.</strong> The natural shortcut is to read each clip over its own length. But
          an oscillator keeps turning whether or not anything drives it, so statistics over a span encode how
          long the span was, and in speech, how long a word lasts says something about which word it is. The
          paper’s leak check measures it: an undriven network, with no input at all, read over each clip’s own
          length recognizes digits about 18% of the time, against 10% for chance. Read over the same frames
          for every clip, it reads exactly 10%. So every arm is read over frames 16 to 61, and everything a
          read carries arrives through the arm’s response to the sound.
        </p>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="leakTable" id="leakTable" />
        </div>
        <p>
          <strong>Why the read starts at frame 16.</strong> Every reservoir starts each clip from the same
          fixed state, and for the first 16 frames (256 ms) its state reflects that starting point more than
          the sound. So every model, the trained baselines included, is read over frames 16 to 61. Nothing is
          thrown away: the input drives each model from the first frame, and what a model remembers of the
          first 256 ms reaches the read through its state. The spectrogram-only baseline has no memory, so
          read over the same frames it would miss the start of the word, which the other models hear. It is
          therefore read over the whole clip, frames 0 to 61, seeing everything the others were driven with,
          and that is the comparison the paper makes. Read from frame 16 instead, it loses 10 to 17 points,
          which is what the first 256 ms of a word are worth on their own (the <em>from frame 0</em> read
          below).
        </p>
        <p>
          Below are spoken-digit classification accuracies for the models in the paper, at different
          readout widths and training sizes: the mean over three seeds on all 6,000 test clips, copied from the
          paper’s record of the controls experiment. The primary cell, the one every comparison is made at, is
          width 192, 2,048 training clips and the four-window read.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel" id="recordExplorer">
          <div className="panelTitle">
            <span>the record: what each readout choice does</span>
            <em>controls experiment · test speakers 49–60</em>
          </div>
          <div className="recControls">
            <label className="field recModel">
              <span>model</span>
              <select className="action" id="recArm" aria-label="model" />
            </label>
            <div className="field"><span>noise</span><div className="seg" id="recNoise" /></div>
            <div className="field"><span>input gain</span><div className="seg" id="recGain" /></div>
            <div className="field"><span>read</span><div className="seg" id="recRead" /></div>
            <div className="field"><span>readout width</span><div className="seg" id="recWidth" /></div>
            <div className="field"><span>training clips</span><div className="seg" id="recSize" /></div>
          </div>
          <div className="recOut">
            <b id="recValue">—</b>
            <span id="recSeeds" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="feLabel">accuracy against readout width</div>
              <div className="canvasFrame"><canvas id="recWidthBars" style={{ height: 150 }} /></div>
            </div>
            <div>
              <div className="feLabel">accuracy against training clips</div>
              <div className="canvasFrame"><canvas id="recSizeBars" style={{ height: 150 }} /></div>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 9 · accuracy by readout.</b> Pick a model and a condition and toggle the
          readout’s settings. <b>Width</b> is how many features the ridge sees (native is the arm’s own
          count, unprojected, fitted at 2,048 clips only). <b>Read</b>: the four windows, the whole span as
          one window, the oscillator networks with their rotation rates added (a read that favours them, since
          no other arm has an analogue), and the baseline from frame 0. Noise is the signal-to-noise ratio:
          at 0 dB the noise is as loud as the speech, at −5 dB louder. Chance is 10%.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 06 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">06 · the comparison</span>The ten models compared</h2>
        <p>
          The controls experiment compares ten models. Each removes one candidate explanation for the
          network’s accuracy.
        </p>
      </Prose>

      <div className="tableBlock">
        <div className="overflow-x-auto">
          <table className="armTable">
            <thead>
              <tr><th>model</th><th>between the front end and the readout</th><th>states</th><th>parameters</th><th>features</th><th>what it isolates</th></tr>
            </thead>
            <tbody>
              <tr><td>spectrogram-only baseline</td><td>nothing: the readout reads the band energies</td><td>0</td><td>0</td><td>192</td><td>what the input alone supports</td></tr>
              <tr><td>coupled oscillator network</td><td>1,024 untrained coupled oscillators</td><td>1,024</td><td>2,048</td><td>24,576</td><td>the system under test</td></tr>
              <tr><td>uncoupled oscillator network</td><td>the same, coupling set to zero</td><td>1,024</td><td>2,048 (1,024 in effect)</td><td>24,576</td><td>the coupling</td></tr>
              <tr><td>leaky-integrator bank, state-matched</td><td>1,024 independent leaky integrators</td><td>1,024</td><td>2,048</td><td>12,288</td><td>oscillation, at equal states</td></tr>
              <tr><td>leaky-integrator bank, width-matched</td><td>2,048 independent leaky integrators</td><td>2,048</td><td>4,096</td><td>24,576</td><td>oscillation, at equal signals</td></tr>
              <tr><td>GRU, TCN, CNN, transformer, S4D</td><td>small conventional networks, trained end to end</td><td>·</td><td>1,840–2,109, all trained</td><td>192–216</td><td>what learning buys at the same budget</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <Prose className={TYPE}>
        <p>
          The four untrained dynamical arms (both oscillator networks and both banks) are the paper’s{' '}
          <strong>reservoirs</strong>, the term reservoir computing uses for a fixed dynamical system read by
          a trained linear layer. The five trained baselines play a different role. Their input layers are
          themselves trained, so they cannot isolate any physics; they answer whether a conventional network
          of the same size, trained normally, does better or worse. Each is trained with AdamW for 30 epochs
          through a learned linear head on the very statistics the ridge reads, standardized, so it is trained
          for the read it is judged by, and is then read by the same ridge as everyone else. The TCN is a
          dilated residual one, as Bai, Kolter and Koltun define it; the CNN is two plain causal convolutions
          that see 9 frames, the local, memoryless baseline. The controls experiment also runs the
          Stuart–Landau network of section 07 on clean audio, so that network stands beside every arm in all
          three conditions.
        </p>
        <h3>The conditions</h3>
        <p>
          <strong>Noise.</strong> Clean audio nearly saturates this task, so white noise is added at
          signal-to-noise ratios of 0 dB (the noise as loud as the speech) and −5 dB (5 dB louder), and clean
          audio is reported for reference. Each clip’s noise is drawn from a generator seeded by the clip
          itself, so a clip sounds the same to every arm. The design experiments of section 07 read only the
          noisy conditions.
        </p>
        <p>
          <strong>Input gain.</strong> The reservoirs are nonlinear, so how hard the input pushes relative to
          their own dynamics changes how they respond: for an oscillator, the input competes with its natural
          frequency, its coupling and the restoring pull; for a leaky integrator, it sets how far into the
          tanh the input reaches. Every reservoir runs at gains 1 and 2, and the sweep experiment takes each
          coupling function’s reference network from gain 0.25 to 12. Gain does not apply to the
          spectrogram-only baseline, whose standardized statistics would divide any fixed scale out exactly,
          nor to the trained baselines, whose first layer learns its own.
        </p>
        <p>
          <strong>Seeds, training sets and reporting.</strong> Every condition runs at three seeds. A seed
          sets an arm’s random draws and which 2,048 of the 24,000 training clips (speakers 1 to 48) the
          readout is fitted on; the test set is always all 6,000 clips of speakers 49 to 60. Accuracies are
          reported as the mean and standard deviation over seeds, and every comparison between two arms is
          paired on the same test clips, with a 95% interval from resampling them. No threshold decides a
          result. For comparison with published numbers, the controls arms also run once on each of Becker et
          al.’s five speaker folds, on clean audio.
        </p>
        <p>
          <strong>Temporal order.</strong> The controls experiment also runs a second task, built so that an
          order-free read of
          the input cannot solve it: two digits spoken one after the other, and the question is which came
          first. The mean and spread of a signal do not depend on the order of its frames, so the
          spectrogram-only baseline, read over the whole span, sits at 50% by construction. Anything above
          that has to come from an arm’s memory of what happened when.
        </p>
      </Prose>

      <Prose className={TYPE}>
        <h3>Eight experiments</h3>
        <p>The study runs these comparisons, and the ablations of the next section, as eight experiments.</p>
      </Prose>

      <div className="tableBlock">
        <div className="overflow-x-auto">
          <table className="armTable">
            <thead>
              <tr><th>experiment</th><th>runs</th><th>what it asks</th></tr>
            </thead>
            <tbody>
              <tr><td>leak check</td><td>13</td><td>Does the pipeline leak? Every reservoir with no input must read exactly chance, and a per-clip read window is measured for how much it would give away.</td></tr>
              <tr><td>controls</td><td>852</td><td>Does the network add anything beyond its input, a leaky-integrator bank of its size, or its own oscillators uncoupled, and how do trained baselines compare? On recognition and on temporal order.</td></tr>
              <tr><td>design</td><td>3,744</td><td>Does the network’s design matter: its coupling function, lattice geometry, natural frequencies, restoring strength and coupling ceiling?</td></tr>
              <tr><td>cochlea</td><td>432</td><td>Do a coil and a cochlea, lattices built to follow the ear, do better than the torus?</td></tr>
              <tr><td>sweep</td><td>684</td><td>What happens beyond the design’s levels: restoring strengths up to 1, ceilings of 1.5 and 2, and input gains from 0.25 to 12?</td></tr>
              <tr><td>quadrature</td><td>126</td><td>Can the networks use a drive that tells them when in a band’s cycle to push (section 08)?</td></tr>
              <tr><td>projection</td><td>432</td><td>Does the readout’s fixed random projection matter? The reservoirs are read again through one drawn from each run’s seed.</td></tr>
              <tr><td>Becker folds</td><td>70</td><td>Where do the arms sit against published AudioMNIST results, on the corpus’s own speaker folds?</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── 07 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">07 · the ablations</span>Changing the physics one factor at a time</h2>
        <p>
          The design experiment asks whether the design of the network matters. It crosses five factors of
          the coupled network, 312 configurations at 0 and −5 dB, both gains and three seeds, and measures
          every effect on <strong>matched pairs</strong>: two runs identical in every factor but the one
          compared, at the same noise level, gain and seed.
        </p>
        <h3>The coupling function</h3>
        <p>
          How the phases of two coupled oscillators turn into a push on one of them. The paper tests six, each
          a standard object in the synchronization literature, each changing one property of the pull.
        </p>
      </Prose>

      <div className="tableBlock">
        <div className="overflow-x-auto">
          <table className="armTable">
            <thead>
              <tr><th>function</th><th>the coupling term for oscillator i</th><th>what it changes</th></tr>
            </thead>
            <tbody>
              <tr><td>Kuramoto</td><td className="mono">Σ K<sub>ij</sub> sin(θ<sub>j</sub> − θ<sub>i</sub>)</td><td>The reference: each oscillator pulled toward the others’ phases.</td></tr>
              <tr><td>Kuramoto–Sakaguchi</td><td className="mono">Σ K<sub>ij</sub> sin(θ<sub>j</sub> − θ<sub>i</sub> − π/4)</td><td>A phase lag that breaks the pull’s symmetry and admits travelling waves.</td></tr>
              <tr><td>second harmonic</td><td className="mono">Kuramoto + ½ Σ K<sub>ij</sub> sin 2(θ<sub>j</sub> − θ<sub>i</sub>)</td><td>Favours two-cluster states: pairs in phase or in opposition.</td></tr>
              <tr><td>Winfree</td><td className="mono">−sin θ<sub>i</sub> Σ K<sub>ij</sub> (1 + cos θ<sub>j</sub>)</td><td>How strongly an oscillator responds, and acts, depends on its own phase.</td></tr>
              <tr><td>Stuart–Landau</td><td className="mono">Σ K<sub>ij</sub> (z<sub>j</sub> − z<sub>i</sub>), z = x + iy</td><td>Amplitude joins phase as state: each oscillator relaxes to a cycle of radius 1.</td></tr>
              <tr><td>Stuart–Landau, fixed amplitude</td><td className="mono">the same, |z| held at 1</td><td>The phase-only limit, which reduces to Kuramoto: it separates what amplitude adds.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <Prose className={TYPE}>
        <h3>The lattice geometry</h3>
        <p>
          Every geometry stores the same 256 oscillators per channel in the same 16 × 16 grid, with row r
          driven by band r. A geometry only changes how the grid’s edges are glued, and so which oscillators
          are neighbours. The kernel is the same table of weights in every case; the gluing decides where each
          weight lands. The design experiment runs six geometries. The cochlea experiment adds two that
          follow the ear itself: a <strong>coil</strong>, the 256 oscillators on one open spiral from the
          apex (the lowest band) to the base (the highest), an octave per turn, and a{' '}
          <strong>cochlea</strong>, the coil with two features of the cochlea’s mechanics. Influence runs three
          times as strongly from base to apex as back, as the travelling wave does, and the coupling into each
          site grows with the spiral’s curvature, from a quarter at the base to full strength at the apex.
          Because that weighting halves the cochlea’s average coupling, a control keeps its shape at the coil’s
          average. Click any oscillator on the grid to see who acts on it.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>who acts on whom · one channel’s kernel under each geometry</span>
            <div className="seg" role="group" aria-label="channel">
              {[0, 1, 2, 3].map((c) => (
                <button type="button" className="segBtn" data-kchan={c} key={c}>ch {c + 1}</button>
              ))}
            </div>
          </div>
          <div className="seg wrap" role="group" aria-label="lattice geometry" style={{ marginBottom: 12 }}>
            {[['torus', 'torus'], ['cylinder', 'cylinder'], ['sheet', 'sheet'], ['helix', 'helix'], ['cube', 'cube'],
              ['sphere', 'sphere'], ['coil', 'coil'], ['cochlea', 'cochlea'], ['cochlea-matched', 'cochlea, matched']].map(([g, name]) => (
              <button type="button" className="segBtn" data-kgeo={g} key={g}>{name}</button>
            ))}
          </div>
          <div className="kernelGrid">
            <div>
              <div className="feLabel">the flat 16 × 16 grid · row 1 (lowest band) at the bottom · click to choose</div>
              <div className="canvasFrame"><canvas id="kernelGrid" className="square" /></div>
            </div>
            <div>
              <div className="feLabel">the shape the gluing makes · drag to turn</div>
              <div className="canvasFrame"><canvas id="kernel3d" className="square" /></div>
            </div>
          </div>
          <p className="viewNote" id="kernelNote" />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 10 · one kernel, every gluing.</b> White: the chosen oscillator. Orange: oscillators that
          pull it toward their phase; blue: ones that push it away; grey: ones that cannot act on it at all.
          The kernel has 16 offsets on each axis, reaching 8 rows or columns one way and 7 the other. On the{' '}
          <b>torus</b> both axes wrap, so every
          oscillator reaches every other and the top band couples to the bottom. The <b>cylinder</b> opens the
          frequency axis, as in the cochlea, so the reach stops at the top and bottom rows: an oscillator in
          the top band hears only the 7 bands below it, and the rest of the cylinder is grey. Choose one in
          row 8 and it reaches all 255. The <b>sheet</b> opens both axes. The{' '}
          <b>helix</b> reads all 256 as one closed coil, 64 to a turn, so a turn away is an octave away. The{' '}
          <b>cube</b> folds each row into a 4 × 4 slab, a 16 × 4 × 4 lattice that wraps on all three axes,
          with shorter paths between the same oscillators. The <b>sphere</b> makes rows latitudes and weights
          each oscillator’s influence by the cosine of its latitude, an approximation to a sphere rather than
          exact spherical coupling. The <b>coil</b> is the helix opened, so its ends never meet and each
          oscillator reaches two turns either way. The <b>cochlea</b> adds a direction (arrowheads, pointing
          to the apex), which shows on the grid as stronger weights from the rows above the chosen oscillator
          than from the rows below, and a curvature weighting, which scales everything arriving at an
          oscillator from 1 at the apex to 1/4 at the base: choose higher rows and the largest weight, below
          the grid, falls. The channel buttons switch between the four channels. Each is a complete copy of the
          lattice with its own kernel, not another part of the shape.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>The other three factors</h3>
        <ul>
          <li>
            <strong>Natural frequencies.</strong> <em>Random</em>, drawn from N(1, 0.1²); <em>tonotopic</em>,
            each row set to the centre frequency of the mel band that drives it, with small jitter, the
            arrangement of the cochlea; <em>identical</em>, all 1.
          </li>
          <li><strong>Restoring strength λ.</strong> 0.3 and 0.1: a longer or shorter memory.</li>
          <li><strong>Coupling ceiling.</strong> 1 and 0.5: stronger or weaker coupling overall.</li>
        </ul>
        <p>
          The two Stuart–Landau functions were run on the torus only, a limit of the study’s scope: their
          core was built for the torus, and the other geometries were wired into the phase oscillators alone.
          The sweep experiment then pushes each
          coupling function’s reference network past these levels, to restoring strengths of 0.5 to 1,
          ceilings of 1.5 and 2, and gains from 0.25 to 12. The console below runs the random-frequency slice
          of the design and cochlea experiments: every coupling function on every geometry it was run on, at
          restoring strength 0.3 and coupling ceiling 1.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 08 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">08 · the drive signal</span>Two input pathways</h2>
        <p>
          Everything so far drives the oscillators with the spectrogram: how loud each band is, frame by frame.
          That throws away something an oscillator could use. Sound is itself oscillation, and a spectrogram
          drive tells an oscillator how hard to push, never <em>when</em> in the sound’s own cycle to push. An
          oscillator nudged at the right moment of every cycle can lock to a rhythm; one pushed at random
          moments cannot. So the paper also drives the network through a pathway that keeps timing, with its
          own spectrogram-only baseline.
        </p>
        <ul>
          <li>
            <strong>Spectrogram.</strong> The front end of section 04: each band’s energy adds to the turning
            rate of its row, the same push whatever the oscillator’s phase. Everything above runs on it.
          </li>
          <li>
            <strong>Quadrature.</strong> Each band’s energy <em>and</em> phase, 62.5 times a second: the phase
            of the band’s centre frequency, demodulated so what remains is how the band drifts around that
            centre (within ±31 Hz). The push becomes g · A · sin(φ − θ): it depends on where the oscillator is
            relative to the band’s own cycle, the phase-referenced drive Adler analysed in 1946, which pulls an
            oscillator into step with the band.
          </li>
        </ul>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>the selected clip, two ways</span>
            <em>16 bands, lowest at the bottom</em>
          </div>
          <div className="feLabel">spectrogram · 61 frames · brightness = energy</div>
          <div className="canvasFrame"><canvas id="pwSpectrogram" style={{ height: 80 }} /></div>
          <div className="feLabel">quadrature · 61 frames · brightness = energy, hue = the band’s phase</div>
          <div className="canvasFrame"><canvas id="pwQuadrature" style={{ height: 80 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 11 · what each pathway hands the network.</b> The same recording (chosen in section 04).
          The spectrogram keeps 0 to 8 kHz at 16 ms resolution and discards phase. Quadrature keeps the same
          energies and adds each band’s drifting phase.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          The paper runs the quadrature pathway on coupled networks only, the four phase coupling functions on
          the torus: a leaky integrator has no phase for the push to act on, and the question is whether
          coupled oscillators can use a phase-referenced drive at all. The console below adds the uncoupled
          network on the quadrature pathway, which the paper did not run, as the obvious reference.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 09 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">09 · run it yourself</span>The experiment, one clip at a time</h2>
        <p>
          Everything below runs in your browser: the front end, the model, the read and the readout, with the
          physics ported line for line from the paper’s harness and the readout for each condition fitted
          exactly the way the paper fits it. Pick a model, a pathway and a condition, pick a recording or
          record yourself saying a digit, and press play. The clip is heard and the network is driven at the
          same moment; the scores appear when the read’s last window closes.
        </p>
        <p>
          Gain and noise snap to the levels the paper ran (gains 1 and 2; clean, 0 dB and −5 dB). Where the
          paper did not run a combination you pick, the console moves the other settings to the nearest one
          it did and says so under the controls. Each prediction comes from a readout fitted at exactly that
          condition at seed 0, and the accuracy beside it is the paper’s, over all three seeds.
        </p>
      </Prose>

      <figure className="my-10">
        <ModelConsole prefix="m" />
        <figcaption className={CAPTION}>
          <b>Figure 12 · the model explorer.</b> The coupled network starts at the paper’s reference
          configuration: Kuramoto coupling on a torus, random natural frequencies, restoring strength 0.3,
          ceiling 1. Change its coupling function or geometry and you are in the design or cochlea experiment;
          switch the pathway and you are in the quadrature experiment, where the rows panel shows each band’s
          phase as hue and its energy as brightness. Noise is added the way the paper adds it, with the same
          noise samples the paper drew for each clip; your own recording gets Gaussian white noise at the same
          signal-to-noise ratio. The ten scores are the readout’s outputs, fitted to 1 for the spoken digit and
          0 for the others, so they are not probabilities and not accuracy: the highest wins. Accuracy is the
          share of the 6,000 test clips on which the highest score is the right digit, and one clip says little
          about it.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 10 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">10 · what we found</span>Mostly the input, and a memory</h2>
        <p>
          <strong>Against its controls.</strong> Read at the common width, the spectrogram alone reads 93.6%
          on clean audio, 78.0% at 0 dB and 71.6% at −5 dB. The Kuramoto network at gain 1 reads 91.1%,
          77.8% and 70.7%: within a point of its own input with noise, and 2.5 points below it on clean audio.
          It reads 0.4 to 1.1 points above the same network uncoupled, and about 4 points above the
          state-matched leaky-integrator bank with noise, though 2.35 below it on clean audio. With noise every
          trained baseline reads above it, from 79.2% (CNN) to 82.8% (GRU) at 0 dB.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/50">
          <Image src="/untrained/figures/fig01-sec4-1-recognition-arms.png" alt="Recognition accuracy for every arm at clean, 0 dB and minus 5 dB, from the paper" width={1981} height={997} className="h-auto w-full" unoptimized />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 13 · every arm at the primary cell</b>, from the paper: mean ± one standard deviation over
          three seeds, the reservoirs at gain 1 (filled) and 2 (open). Dashed line: the whole-clip
          spectrogram-only baseline.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          <strong>What the dynamics add is memory.</strong> Read only after its 16-frame warm-up, the network
          reads 7.5 to 15.9 points above its input read over the same frames: it carries the onset, which the
          input loses without its first 16 frames. On the order task, which the input alone cannot solve
          (49.8% to 50.6%), it reads 95.5% to 97.7%. The leaky-integrator banks do both, and better on order,
          98.7% to 99.9%. The reason is the same in both: apart from the restoring pull and the coupling, an
          oscillator’s phase is the running sum of its band’s energy wrapped around a circle. Oscillation adds
          no memory the bank lacks; the phase is an integrator whose sum wraps. Coupling adds about a point on
          noisy recognition and 2 to 19 points on order.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/50">
          <Image src="/untrained/figures/fig02-sec4-2-order-arms.png" alt="Temporal-order accuracy for every arm, from the paper" width={1982} height={936} className="h-auto w-full" unoptimized />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 14 · temporal order</b>, from the paper: which of two digits came first, averaged over five
          digit pairs. Dotted line: chance. The CNN sees 9 frames, less than a digit, so with noise it reads
          chance.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          <strong>Design.</strong> Among phase oscillators, the coupling function moved accuracy by at most half
          a point, and every lattice geometry read within 0.65 points of the torus. The coil read within 0.22
          points of it and the cochlea 0.41 to 0.97 below: built to follow the ear, they read no better. The one
          design choice that mattered was a free amplitude. The Stuart–Landau network reads 2.1 to 3.8 points
          above its Kuramoto match and, at the reference configuration, above its own input in every noisy
          condition, by 1.1 to 2.3 points, which puts it in the trained baselines’ range. With its amplitude
          fixed it reads like Kuramoto, so the effect is the amplitude, not the coupling form.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/50">
          <Image src="/untrained/figures/fig04-sec4-4-lattice-geometries.png" alt="Each lattice geometry minus the torus, from the paper" width={1763} height={579} className="h-auto w-full" unoptimized />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 15 · lattice geometry</b>, from the paper: each geometry minus the torus, paired, with 95%
          intervals. Left of the grey line, the design experiment; right, the cochlea experiment.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          <strong>Gain and drive.</strong> Gain separates the Stuart–Landau network from the rest: from gain 1
          to gain 8 it lost 3 to 4 points while every phase-oscillator network lost 15 to 19, as if a free
          amplitude lets an oscillator absorb a strong drive in its radius where a phase can only be pushed
          faster. Below gain 1 the order reverses, and at their better low gain the phase networks read above
          their input at 0 dB. Driven in quadrature, every network read near chance, 11.7% to 15.1%: in no
          run did more than 0.3% of its oscillators lock to their band.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700/50">
          <Image src="/untrained/figures/fig06-sec4-5-restoring-ceiling-gain.png" alt="Accuracy of each coupling function against restoring strength, coupling ceiling and input gain, from the paper" width={1977} height={1026} className="h-auto w-full" unoptimized />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 16 · restoring strength, ceiling and gain</b>, from the paper, for each coupling function at
          the reference configuration, at 0 dB (top) and −5 dB (bottom).
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          <strong>The readout.</strong> Widening the readout to 4,096 features lifts the reservoirs above their
          input, but through a readout with 21 times as many fitted weights, so the fair comparison stays at the
          common width. More training data helps the trained baselines three to six times as much as the
          network, since in a reservoir only the readout learns.
        </p>
        <p>
          <strong>In short.</strong> Untrained and read at a common width, a coupled oscillator network
          classifies noisy, held-out spoken digits about as well as its own input, and carries the order of
          events by integrating it, as a leaky-integrator bank does. Coupling adds a little to both; a free
          amplitude lifts it above its input and into the trained baselines’ range; the geometry and the phase
          coupling function each move it by less than a point. Those numbers are the baseline a trained
          oscillator network of this size, on this task, should beat.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 11 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">11 · go deeper</span>The paper, the code and the prior art</h2>
        <p>
          The paper, the harness that ran every model on this page, and the per-run record behind every
          number quoted here are public. The browser code here is a port of that harness, checked against it:
          the scores your browser computes match the harness’s on every demo clip, and every untrained arm’s
          readout, rescored on the full test set, reproduces the paper’s seed-0 accuracy.
        </p>
        <p style={{ marginTop: '1.5rem' }} className="flex flex-wrap gap-3">
          <a className="action primary" href={PDF} {...ext} style={{ textDecoration: 'none', display: 'inline-block' }}>
            Read the paper (PDF) →
          </a>
          <a className="action" href={PAPER} {...ext} style={{ textDecoration: 'none', display: 'inline-block' }}>
            Its code and record on GitHub →
          </a>
        </p>

        <h3>Further reading</h3>
        <div className="not-prose mt-6 rounded-2xl border border-zinc-200 bg-zinc-100/60 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/40">
          <ul className="space-y-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 [&_a]:text-violet-500 dark:[&_a]:text-violet-400">
            <li><Link href={FIRST_POST} className="font-medium">How a machine hears a number</Link>: the first post, from pressure waves to an oscillator core</li>
            <li><a href={REPO} {...ext} className="font-medium">oscillator-research</a>: every paper in this programme, with its code and data</li>
            <li><a href="https://doi.org/10.1007/BFb0013365" {...ext} className="font-medium">Kuramoto (1975)</a>: the minimal model of synchronization</li>
            <li><a href="https://doi.org/10.1143/PTP.76.576" {...ext} className="font-medium">Sakaguchi and Kuramoto (1986)</a>: the phase-lagged coupling</li>
            <li><a href="https://doi.org/10.1016/0022-5193%2867%2990051-3" {...ext} className="font-medium">Winfree (1967)</a>: phase response and influence</li>
            <li><a href="https://doi.org/10.1109/JRPROC.1946.229930" {...ext} className="font-medium">Adler (1946)</a>: locking an oscillator to an injected signal</li>
            <li><a href="https://doi.org/10.1103/RevModPhys.74.99" {...ext} className="font-medium">Aranson and Kramer (2002)</a>: the complex Ginzburg–Landau equation, Stuart–Landau’s field</li>
            <li><a href="https://www.ai.rug.nl/minds/uploads/EchoStatesTechRep.pdf" {...ext} className="font-medium">Jaeger (2001)</a> and <a href="https://doi.org/10.1162/089976602760407955" {...ext} className="font-medium">Maass et al. (2002)</a>: reservoir computing</li>
            <li><a href="https://doi.org/10.1016/j.neunet.2007.04.016" {...ext} className="font-medium">Jaeger et al. (2007)</a>: leaky-integrator echo state networks</li>
            <li><a href="https://doi.org/10.1016/j.jfranklin.2023.11.038" {...ext} className="font-medium">Becker et al. (2024)</a>: AudioMNIST, and the speaker folds used for comparison with published results</li>
            <li><a href="https://doi.org/10.1038/s41598-019-56991-x" {...ext} className="font-medium">Abreu Araujo et al. (2020)</a>: how much of an oscillator reservoir’s accuracy its front end supplies</li>
            <li><a href="https://doi.org/10.2139/ssrn.7445198" {...ext} className="font-medium">Kryski (2026)</a>: the survey of oscillator networks in machine learning that found these ablations missing</li>
          </ul>
        </div>
      </Prose>

      <aside className="mt-16 rounded-r-xl border-l-2 border-amber-500 bg-amber-500/5 px-5 py-4 dark:border-amber-300 dark:bg-amber-300/5">
        <h2 className="font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase dark:text-amber-300">
          Caveats
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed text-zinc-600 marker:text-amber-500/60 dark:text-zinc-400">
          <li>
            The console runs seed 0 of each model. The paper’s accuracy beside each is the mean over three
            seeds on 6,000 test clips; a single clip, or a handful, says almost nothing about either.
          </li>
          <li>
            Every readout on this page was refitted with the paper’s code at seed 0, and the trained baselines
            were retrained the same way. Of the 211 that have a cell in the paper’s record, 210 reproduce its
            seed-0 accuracy exactly; the other, the matched cochlea with Kuramoto coupling at gain 1 and −5 dB,
            differs by one clip in 6,000.
          </li>
          <li>
            Your own recording is shaped like a corpus clip before it is run, but it is not one: a different
            microphone, a room with different background noise, and your unique voice. The readouts were fitted
            to the AudioMNIST training clips alone.
          </li>
          <li>
            The paper’s harness computes in 32-bit floating point and this page in 64-bit. Over a clip’s 61
            frames the difference does not grow: on every demo clip, every score on this page is within 0.0004
            of the harness’s, and no prediction changes.
          </li>
        </ul>
      </aside>
    </>
  )
}
