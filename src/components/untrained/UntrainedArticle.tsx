import Link from 'next/link'

import { Prose } from '@/components/Prose'
import { ModelConsole } from '@/components/untrained/ModelConsole'

const REPO = 'https://github.com/ekryski/oscillator-research'
const PAPER = `${REPO}/tree/main/papers/02-untrained-reservoirs`
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
          oscillators were never trained. Their coupling was drawn at random once and frozen, and only a
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
          The second paper in this research programme is built to separate those three explanations. It
          freezes a small oscillator network, reads it the same way it reads every alternative, and compares
          it against models that each remove one ingredient: the dynamics entirely, the oscillation, the
          coupling. It then changes the physics one factor at a time. The design was written down and frozen
          before a single registered run, so none of it could be tuned to the answer.
        </p>
        <p>
          This page explains that experiment: what each model is, how they were compared, and why the
          comparisons are the ones they are. Every model the paper tested at its core is also running here,
          in your browser, on real recordings, so you can do the experiment yourself one clip at a time.
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
            <text x="330" y="26" className="hd">THE ONLY THING THAT CHANGES</text>
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
              every arm sits in the same slot, is read by the same function, and is scored by a readout of the same size
            </text>
          </svg>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 1 · one slot, many occupants.</b> The paper’s design in one picture. The front end, the
          way signals are summarized and the readout are identical for every model; only the box in the
          middle changes. The untrained arms have no fitted parameters at all: only the readout’s 1,930
          weights are fitted, so any difference between two arms is a difference in what they did to the
          same input.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 02 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">02 · oscillators</span>A crowd that keeps its own time</h2>
        <p>
          An oscillator is anything that cycles: a pendulum, a firefly’s flash, a neuron that fires
          rhythmically. The simplest mathematical version keeps a single number, its <strong>phase</strong>{' '}
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
        <h2><span className="num">03 · the control with memory</span>Leaky integrators: memory that never turns</h2>
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
        <p className="!font-mono !text-base">x ← (1 − a) · x + a · tanh(g<sub>in</sub> · g · u)</p>
        <p>
          The old value decays, or leaks, so the unit is a running average of its recent input, with a time
          constant set by the leak rate a. In signal-processing terms it is a first-order low-pass filter; in
          reservoir computing it is the unit of a leaky echo state network. The tanh bounds the input, so a
          loud enough band saturates it.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>one band’s energy through five leaky integrators</span>
            <em>band <b id="leakyBandVal">7</b></em>
          </div>
          <div className="canvasFrame"><canvas id="leakyCanvas" style={{ height: 170 }} /></div>
          <div className="grid gap-4 sm:grid-cols-2" style={{ marginTop: 12 }}>
            <div className="dial">
              <label htmlFor="leakyBand">mel band <b>low → high</b></label>
              <input className="slider" type="range" id="leakyBand" min="0" max="15" defaultValue="6" />
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
          <b>Figure 4 · fast and slow memories.</b> Grey: one mel band’s energy over the selected clip (pick a
          clip in section 04). Coloured: five leaky integrators fed that band, with time constants of 16 ms
          (orange), 45 ms, 125 ms, 350 ms and 1 s (violet). The fast ones track every syllable; the slow ones
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
            <em>dark = fast · pale = slow</em>
          </div>
          <div className="canvasFrame"><canvas id="bankLayout" style={{ height: 170 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 5 · every band at every time scale.</b> The bank stored as the network is: four channels
          of 16 × 16, row r fed by mel band r. Within a row, the 64 units run from the fastest (channel 1,
          left) to the slowest (channel 4, right), so each band is integrated over 64 time scales.
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
          <b>Figure 6 · the front end, live.</b> Every clip on this page comes from{' '}
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
            <tr><td>warm-up</td><td>16 frames (256 ms)</td><td>Discarded by the read, so every arm is read after its state has settled from the same initial condition.</td></tr>
          </tbody>
        </table>
        <p>
          Nothing in the front end is trained, and nothing depends on the clip. The same arithmetic runs
          here in your browser: the rows you see are identical, to rounding, to the rows the paper’s harness
          computed.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 05 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">05 · the readout</span>One reader for every model</h2>
        <p>
          The readout is where a comparison like this is most easily rigged, usually by accident. The paper’s
          exploratory phase, which came before the registered study, read its models three different ways,
          and one of those differences was large enough to decide the result on its own. So the registered
          design reads every arm with exactly one function, in four steps.
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
            width. An arm already at or below 192 is read as it is.
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
              <button type="button" className="segBtn" data-rarm="field">coupled</button>
              <button type="button" className="segBtn" data-rarm="severed">uncoupled</button>
              <button type="button" className="segBtn" data-rarm="bank-c4">leaky bank</button>
              <button type="button" className="segBtn" data-rarm="floor">spectrogram only</button>
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
          <b>Figure 7 · the read, step by step.</b> The selected clip (section 04) through each arm at gain 1
          on clean audio, and through that arm’s fitted readout. The coupled network exposes 2,048 signals, so
          its read is 24,576 numbers before the projection brings it to 192; the spectrogram-only baseline
          exposes 16 and reaches exactly 192 on its own.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>Why these choices</h3>
        <p>
          <strong>The same width for every arm.</strong> A ridge’s capacity grows with the number of features
          it is handed. In the exploratory phase the network was read with 16,384 features and its
          spectrogram-only baseline with 192, so the ridge had 163,840 coefficients for one and 1,920 for the
          other. The one width-matched read in that record put the network below its baseline in 936 of 936
          runs. Reading every arm at 192 means a difference in accuracy is not a difference in how much the
          readout was allowed to memorize.
        </p>
        <p>
          <strong>One fixed window.</strong> The exploratory harness read each clip over its own length. An
          oscillator keeps turning whether or not anything drives it, so statistics over a span encode how
          long the span was, and in speech, how long a word lasts says something about which word it is. An
          undriven network, with no input at all, read over each clip’s own length recognizes digits well
          above chance. Read over the same frames for every clip, it reads exactly chance. The registered
          design reads every arm over frames 16 to 61, so everything a read carries arrives through the arm’s
          response to the sound.
        </p>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="leakTable" id="leakTable" />
        </div>
        <p>
          <strong>The whole-clip baseline is the primary control.</strong> Every arm skips the first 16
          frames, but the start of a word is informative, and an arm can carry it forward in its memory. So
          the spectrogram-only baseline is also read from frame 0, seeing everything the other arms were driven
          with, and that harder version is the comparison that counts.
        </p>
        <p>
          <strong>Registered numbers, not new ones.</strong> Below, every accuracy is copied from the paper’s
          record: the mean over three seeds on all 6,000 test clips, for every read, width and training size
          the paper ran. The primary cell, the one every comparison is made at, is width 192, 2,048 training
          clips and the four-window read.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel" id="recordExplorer">
          <div className="panelTitle">
            <span>the record: what each readout choice does</span>
            <em>Tier 1 · test speakers 49–60</em>
          </div>
          <div className="controlGrid">
            <label className="field">
              <span>model</span>
              <select className="action" id="recArm" aria-label="model" />
            </label>
            <div className="field"><span>noise</span><div className="seg" id="recNoise" /></div>
            <div className="field"><span>input gain</span><div className="seg" id="recGain" /></div>
            <div className="field"><span>read</span><div className="seg" id="recRead" /></div>
            <div className="field"><span>training clips</span><div className="seg" id="recSize" /></div>
            <div className="field"><span>readout width</span><div className="seg" id="recWidth" /></div>
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
          <b>Figure 8 · the readout’s choices, priced.</b> Pick a model and a condition and toggle the
          readout’s settings. <b>Width</b> is how many features the ridge sees (native is the arm’s own
          count, unprojected, fitted at 2,048 clips only). <b>Read</b>: the four windows, the whole span as
          one window, the oscillator networks with their rotation rates added (a read that favours them, since
          no other arm has an analogue), and the baseline from frame 0. Chance is 10%.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 06 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">06 · the comparison</span>Ten models, one slot</h2>
        <p>
          Tier 1 of the paper puts ten models in the slot, each chosen to remove exactly one candidate
          explanation for the network’s accuracy.
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
          through a learned linear head on the very statistics the ridge reads, so it is trained for the read
          it is judged by, and is then read by the same ridge as everyone else.
        </p>
        <h3>The conditions</h3>
        <p>
          <strong>Noise.</strong> Clean audio, and white noise added at 0 dB and +5 dB relative to the
          speech: at 0 dB the noise is as loud as the speech, and at +5 dB it is louder. Each clip’s noise is
          drawn from a generator seeded by the clip itself, so a clip sounds the same to every arm. Clean audio
          nearly saturates this task, so only the noisy conditions carry a design verdict.
        </p>
        <p>
          <strong>Input gain.</strong> The reservoirs are nonlinear, so how hard the input pushes relative to
          their own dynamics changes how they respond: for an oscillator, the input competes with its natural
          frequency, its coupling and the restoring pull; for a leaky integrator, it sets how far into the
          tanh the input reaches. Every reservoir runs at gains 1 and 2. Gain does not apply to the
          spectrogram-only baseline, whose standardized statistics would divide any fixed scale out exactly,
          nor to the trained baselines, whose first layer learns its own.
        </p>
        <p>
          <strong>Seeds, training sets and reporting.</strong> Every condition runs at three seeds. A seed
          sets an arm’s random draws and which 2,048 of the 24,000 training clips (speakers 1 to 48) the
          readout is fitted on; the test set is always all 6,000 clips of speakers 49 to 60. Accuracies are
          reported as the mean and standard deviation over seeds, and every comparison between two arms is
          paired on the same test clips, with a 95% interval from resampling them. No threshold decides a
          result.
        </p>
        <p>
          <strong>Temporal order.</strong> Tier 1 also runs a second task, built so that an order-free read of
          the input cannot solve it: two digits spoken one after the other, and the question is which came
          first. The mean and spread of a signal do not depend on the order of its frames, so the
          spectrogram-only baseline, read over the whole span, sits at 50% by construction. Anything above
          that has to come from an arm’s memory of what happened when.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 07 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">07 · the ablations</span>Changing the physics one factor at a time</h2>
        <p>
          Tier 2 asks whether the design of the network matters. It varies five factors of the coupled
          network across 3,744 runs, and every effect is measured on <strong>matched pairs</strong>: two runs
          identical in every factor but the one compared, at the same noise level, gain and seed.
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
          weight lands. Click any oscillator on the grid to see who acts on it.
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
            {['torus', 'cylinder', 'sheet', 'helix', 'cube', 'sphere'].map((g) => (
              <button type="button" className="segBtn" data-kgeo={g} key={g}>{g}</button>
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
          <b>Figure 9 · one kernel, six gluings.</b> White: the chosen oscillator. Orange: oscillators that
          pull it toward their phase; blue: ones that push it away; black: none. On the <b>torus</b> both axes
          wrap, so the top band couples to the bottom. The <b>cylinder</b> opens the frequency axis, as in the
          cochlea, and the <b>sheet</b> opens both, so coupling stops at the edges. The <b>helix</b> reads all
          256 as one closed coil, 64 to a turn, so a turn away is an octave away. The <b>cube</b> folds each
          row into a 4 × 4 slab, a 16 × 4 × 4 lattice that wraps on all three axes, with shorter paths between
          the same oscillators. The <b>sphere</b> makes rows latitudes and weights each oscillator’s influence
          by the cosine of its latitude, an approximation to a sphere rather than exact spherical coupling.
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
          The two Stuart–Landau functions were run on the torus only, and design verdicts are read at 0 and
          +5 dB, both gains and three seeds. The consoles below let you run the torus-and-random-frequency
          slice of this design, every coupling function on every geometry, at restoring strength 0.3 and
          ceiling 1.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 08 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">08 · run it yourself</span>The experiment, one clip at a time</h2>
        <p>
          Everything below runs in your browser: the front end, the arm, the read and the readout, with the
          physics ported line for line from the paper’s harness and the readout for each condition fitted
          exactly the way the paper fits it. Pick a model and a condition, pick a recording or record
          yourself saying a digit, and press play. The clip is heard and the network is driven at the same
          moment; the scores appear when the read’s last window closes.
        </p>
        <p>
          Gain and noise snap to the levels the paper registered, and a control is disabled where the paper
          ran nothing. Each prediction comes from a readout fitted at exactly that condition at seed 0, and the
          accuracy beside it is the record’s, over all three seeds.
        </p>
      </Prose>

      <figure className="my-10">
        <ModelConsole prefix="m" />
        <figcaption className={CAPTION}>
          <b>Figure 10 · the model explorer.</b> The coupled network is Tier 1’s: Kuramoto coupling on a torus,
          random natural frequencies, restoring strength 0.3, ceiling 1. Change its coupling function or
          geometry and you are in Tier 2. Noise is added the way the paper adds it, with each clip’s own
          recorded noise; your own recording gets a fresh draw of the same recipe. Accuracy on one clip says
          little: the record’s number beside it is over 6,000.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 09 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">09 · the drive signal</span>Three ways to push an oscillator</h2>
        <p>
          Everything so far drives the oscillators with band energies: how loud each band is, frame by frame.
          That throws away something an oscillator could use. Sound is itself oscillation, and a band-energy
          drive tells an oscillator how hard to push, never <em>when</em> in the sound’s own cycle to push. An
          oscillator nudged at the right moment of every cycle can lock to a rhythm; one pushed at random
          moments cannot. The paper tests two pathways that keep timing, each with its own spectrogram-only
          baseline.
        </p>
        <ul>
          <li>
            <strong>Band-energy.</strong> The front end of section 04: each band’s energy adds to the turning
            rate of its row, the same push whatever the oscillator’s phase. Everything above runs on it.
          </li>
          <li>
            <strong>Quadrature.</strong> Each band’s energy <em>and</em> phase, 62.5 times a second: the phase
            of the band’s centre frequency, demodulated so what remains is how the band drifts around that
            centre (within ±31 Hz). The push becomes g · A · sin(φ − θ): it depends on where the oscillator is
            relative to the band’s own cycle, the phase-referenced drive Adler analysed in 1946, which pulls an
            oscillator into step with the band.
          </li>
          <li>
            <strong>Carrier.</strong> No envelope at all: the waveform itself, split into 16 bands from 96 to
            1,536 Hz, drives the network 16,000 times a second, at gain 32. An oscillator whose natural
            frequency sits near its band’s can lock to it directly, as a tuning fork does. At this rate a free
            oscillator turns about 255 times a second, inside the bands it is driven with.
          </li>
        </ul>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>the selected clip, three ways</span>
            <em>16 bands, lowest at the bottom</em>
          </div>
          <div className="feLabel">band-energy · 61 frames · brightness = energy</div>
          <div className="canvasFrame"><canvas id="pwEnvelope" style={{ height: 80 }} /></div>
          <div className="feLabel">quadrature · 61 frames · brightness = energy, hue = the band’s phase</div>
          <div className="canvasFrame"><canvas id="pwQuadrature" style={{ height: 80 }} /></div>
          <div className="feLabel">carrier · 16,000 samples · orange positive, blue negative</div>
          <div className="canvasFrame"><canvas id="pwCarrier" style={{ height: 80 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 11 · what each pathway hands the network.</b> The same recording (chosen in section 04).
          Band-energy keeps 0 to 8 kHz at 16 ms resolution and discards phase. Quadrature keeps the same
          energies and adds each band’s drifting phase. Carrier keeps the waveform’s timing sample by sample,
          but only between 96 and 1,536 Hz.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          The console below restricts itself to the three reservoirs this question is about, the leaky bank,
          the uncoupled network and the coupled network, on the torus with random natural frequencies. Two
          pairings do not exist: a leaky integrator has no phase for a quadrature pair to act on, and the
          Stuart–Landau networks were built for the band-energy and carrier pathways only. The paper
          registered the carrier at one condition, 0 dB and gain 32, because it runs 262 times as many steps
          per clip; here it takes a few seconds. The uncoupled network on the quadrature and carrier pathways
          is not a registered arm, and is included as the obvious reference.
        </p>
      </Prose>

      <figure className="my-10">
        <ModelConsole prefix="d" drive />
        <figcaption className={CAPTION}>
          <b>Figure 12 · the drive explorer.</b> On the quadrature pathway the network’s left panel shows the
          same oscillators as before; the rows panel shows each band’s phase as hue. On the carrier pathway
          the network steps 16,000 times per second, and the figures show every 16th step.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 10 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">10 · what we found</span>Results, when the record is complete</h2>
        <p>
          This section is waiting for the paper’s registered runs to finish. When they do, it will summarize
          what each comparison showed, with the same numbers the consoles above quote, whichever way they fall.
          Until then, the accuracies shown in the explorers are the ones recorded so far, and the configurations
          whose tiers are still running say so.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 11 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">11 · go deeper</span>The paper, the code and the prior art</h2>
        <p>
          The paper, its registration, the harness that ran every model on this page, and the raw per-run
          record behind every number quoted here are public. The browser code here is a port of that harness,
          checked against it: on the 61-frame pathways, the scores your browser computes match the harness’s
          on every demo clip, and every untrained arm’s readout, rescored on the full test set, reproduces
          the record’s seed-0 accuracy wherever the record has that cell.
        </p>
        <p style={{ marginTop: '1.5rem' }}>
          <a className="action primary" href={PAPER} {...ext} style={{ textDecoration: 'none', display: 'inline-block' }}>
            Paper 02 and its code on GitHub →
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
          </ul>
        </div>
      </Prose>

      <aside className="mt-16 rounded-r-xl border-l-2 border-amber-500 bg-amber-500/5 px-5 py-4 dark:border-amber-300 dark:bg-amber-300/5">
        <h2 className="font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase dark:text-amber-300">
          Caveats, stated plainly
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed text-zinc-600 marker:text-amber-500/60 dark:text-zinc-400">
          <li>
            The consoles run seed 0 of each model. The record’s accuracy beside each is the mean over three
            seeds on 6,000 test clips; a single clip, or a handful, says almost nothing about either.
          </li>
          <li>
            The trained baselines were retrained for this page at seed 0 with the paper’s recipe. Training on a
            different machine is not bit-for-bit reproducible, so their scores can differ slightly from the
            record’s seed 0.
          </li>
          <li>
            Your own recording is shaped like a corpus clip before it is run, but it is not one: a different
            microphone, room and voice. The readouts were fitted on AudioMNIST alone.
          </li>
          <li>
            On the carrier pathway the oscillator networks run 16,000 steps a clip. The paper’s harness
            computes them in 32-bit floating point and this page in 64-bit, and over that many steps the two
            drift apart by up to a few percent of a signal’s range, so the page’s carrier scores can differ a
            little from the harness’s for the same clip. On the 61-frame pathways they agree to three decimal
            places or better.
          </li>
        </ul>
      </aside>
    </>
  )
}
