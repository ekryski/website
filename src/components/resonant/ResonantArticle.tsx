import Image from 'next/image'

import { Prose } from '@/components/Prose'
import { ResonantConsole } from '@/components/resonant/ResonantConsole'

// The repository is not public yet — kept for the commented-out repo links below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REPO = 'https://github.com/ekryski/resonant'

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


/**
 * The guide itself — markup only, no state. The canvases and controls are
 * driven by src/lib/resonant/guide.js, which finds them by id after mount.
 */
export function ResonantArticle() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────── 01 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">01 — the problem</span>Sound is a terrible input format</h2>
        <p>
          Say <em>“seven”</em> out loud. Your vocal folds chop an airflow into pulses, your
          throat and mouth shape those pulses into resonances, and a pressure wave leaves
          your face at about 340 m/s. A microphone measures that pressure 16,000 times a
          second and writes down a number each time. One second of speech is a list of
          16,000 numbers.
        </p>
        <p>Pick a digit below and look at what a model is actually handed.</p>
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
          <div className="canvasFrame" style={{ marginTop: 14 }}>
            <canvas id="waveCanvas" style={{ height: 150 }} />
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 1 — one second of speech, as recorded.</b> Every clip on this page comes
          from{' '}
          <a href="https://github.com/soerenab/AudioMNIST" target="_blank" rel="noopener noreferrer" className="underline">
            AudioMNIST
          </a>
          , an open corpus of spoken digits. Amplitude over time, 16,000 samples. You can see <em>where</em> the energy is, and roughly how many syllables
          there are. You cannot see which word it is: the same digit spoken by two people
          produces two wildly different squiggles, and shifting the recording by 5
          milliseconds changes every single number while changing nothing a listener would
          notice. Train a classifier directly on these numbers and it spends its capacity
          rediscovering the obvious.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          The fix is a hundred years older than deep learning: stop describing the wave and
          start describing <strong>which frequencies are present, and when</strong>. Two
          recordings of “seven” differ enormously sample by sample, and look almost the same
          once you plot them that way. Everything in the rest of this guide — every
          architecture, conventional or exotic — sits behind that same transformation.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 02 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">02 — the fourier transform</span>One slice, taken apart into pure tones</h2>
        <p>
          Fourier’s claim: any wave, however jagged, is a sum of plain sine waves at
          different frequencies, amplitudes, and phase offsets. The <strong>Fast Fourier
          Transform (FFT)</strong> is the algorithm that finds those ingredients — it takes
          a block of samples and returns, for each frequency, how much of it is in there.
        </p>
        <p>
          The catch is in the word <em>block</em>. An FFT over a whole second tells you
          every frequency the second contained, and nothing about the order they arrived
          in. “Seven” and “teevn” would come out identical. So we take a small block — 512
          samples here, 32 milliseconds, short enough that the mouth barely moves — and
          analyze that.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>drag the window</span>
            <em id="fftPosLabel">—</em>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="canvasFrame"><canvas id="fftWaveCanvas" style={{ height: 130 }} /></div>
              <input className="slider" type="range" id="fftPos" min="0" max="100" defaultValue="45"
                     style={{ marginTop: 10 }} aria-label="analysis window position" />
            </div>
            <div className="canvasFrame"><canvas id="fftSpecCanvas" style={{ height: 176 }} /></div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 2 — a 32 ms window and its spectrum.</b> Left: the highlighted slice of
          the recording. Right: the FFT of that slice — energy against frequency, 0 to
          8 kHz. Slide it into a vowel and the low end fills with regularly spaced peaks
          (the pitch of the voice and its harmonics) riding under a lumpy envelope (the{' '}
          <em>formants</em> — the resonances of the throat and mouth that decide which vowel
          it is). Slide it onto the “s” of “seven” or the “x” of “six” and that structure
          flattens into broadband hiss weighted toward the top of the range. Slide it into
          the silence at either end and the whole curve drops. That difference — periodic
          versus noisy — is doing a lot of work later.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 03 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">03 — the STFT</span>Slide the window: a picture of sound</h2>
        <p>
          The <strong>Short-Time Fourier Transform (STFT)</strong> is just the previous
          figure on repeat: take a window, FFT it, shift the window forward by a fixed{' '}
          <em>hop</em>, repeat to the end of the file, and stack the results side by side.
          The result is a <strong>spectrogram</strong>: time along the x-axis, frequency up
          the y-axis, brightness for energy.
        </p>
        <p>
          Two parameters set the whole grid, and they trade against each other. A longer
          window resolves frequency more finely but smears events in time; a shorter one
          localizes the click of a “t” but cannot tell 300 Hz from 320 Hz. The settings used
          throughout this guide are the ones the digit experiments actually use: a
          512-sample window (<code>n_fft = 512</code>, 32 ms) hopping 256 samples (16 ms),
          which yields <strong>62.5 frames per second</strong> — one frame per 16 ms of
          speech.
        </p>
        <p>
          Before the STFT, each window is multiplied by a smooth bell (a <strong>Hann
          window</strong>). Cutting a block out with hard edges would add a click the FFT
          dutifully reports as high-frequency energy that is not in the signal; tapering the
          edges removes it.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>STFT · 257 frequency bins × 61 frames</span>
            <em>power, log scale</em>
          </div>
          <div className="canvasFrame"><canvas id="stftCanvas" style={{ height: 230 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 3 — the spectrogram of the selected digit.</b> Horizontal stripes are
          the harmonics of the voice; the wavering bright bands are formants moving as the
          mouth changes shape; vertical smears are the bursts and hisses of consonants. This
          is the representation most audio models are built on, and this is the object that
          made computer-vision architectures work on sound: it is a picture, so anything
          that finds patterns in pictures can be pointed at it.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 04 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">04 — the mel scale</span>Rebuilding the axis around the ear</h2>
        <p>
          257 frequency bins, evenly spaced from 0 to 8 kHz, is not how hearing works. The
          gap between 100 Hz and 200 Hz is obvious to anyone; the gap between 6,000 Hz and
          6,100 Hz is inaudible, though both are 100 Hz. Resolution in the ear is roughly
          logarithmic — fine at the bottom, coarse at the top.
        </p>
        <p>
          The <strong>mel scale</strong> (from “melody”) is the warped frequency axis where
          equal distances sound like equal pitch steps. The common formula is{' '}
          <code>mel = 2595 · log₁₀(1 + Hz / 700)</code>, near-linear below 1 kHz and
          increasingly compressive above it.
        </p>
        <p>
          Press play below and watch which filters actually fire while the digit is spoken.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="action primary toggle wide" id="melPlayBtn">
              ▶ Play and watch the bands
            </button>
            <span className="tag" id="melPlayStatus">showing the clip average</span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel">
            <div className="panelTitle">
              <span>hz → mel</span>
              <em>the ear’s ruler</em>
            </div>
            <div className="canvasFrame"><canvas id="melCurveCanvas" style={{ height: 200 }} /></div>
          </div>
          <div className="panel">
            <div className="panelTitle">
              <span>the filterbank</span>
              <em>16 triangles over 257 bins</em>
            </div>
            <div className="canvasFrame"><canvas id="melFbCanvas" style={{ height: 200 }} /></div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 4 — warping, then pooling, lit up by the actual recording.</b> Left:
          physical frequency in, perceptual frequency out — each stem marks a mel band this
          clip is using right now, planted at its frequency and rising to where the ear puts
          it. Right: the filterbank exported from the project’s front end — 16 triangular
          windows, evenly spaced <em>on the mel axis</em>, therefore narrow and crowded at
          low frequency and wide and sparse at high frequency; each one brightens with its
          own energy. Press play and you can watch a vowel light the low, tightly packed
          filters while the “s” in “six” and “seven” throws energy into the wide ones at the
          top. Each triangle sums the STFT bins underneath it into a single number, so a
          257-number column becomes a 16-number column.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          One more step, and it matters more than it looks. Loudness is perceived
          logarithmically too, so we take the log of each band’s energy. That turns the
          ratios that matter into differences a network can add and subtract, and it stops
          one loud vowel from dominating the numbers. <strong>STFT → mel filterbank →
          log</strong> is the standard audio front end; the result is the <strong>log-mel
          spectrogram</strong>.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>log-mel · 16 bands × 61 frames</span>
            <em>what the model is fed</em>
          </div>
          <div className="canvasFrame"><canvas id="melSpecCanvas" style={{ height: 180 }} /></div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 5 — the same second, now 976 numbers instead of 16,000.</b> Low bands at
          the bottom, high at the top. Almost everything that distinguishes one spoken digit
          from another survives this compression — which is why nearly every speech system,
          classifier or synthesizer, starts here.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <div className="my-6 rounded-r-xl border-l-2 border-violet-500 bg-violet-500/5 px-5 py-4 dark:border-violet-400 dark:bg-violet-400/5">
          <h4 className="!mt-0 !mb-3 !text-base !font-bold !tracking-normal !normal-case !text-zinc-800 dark:!text-zinc-100">
            Sidebar: what is a “mel transcoder”?
          </h4>
          <p className="!my-0 !text-[15px] !leading-relaxed">
            A neural network that <em>manufactures</em> a mel spectrogram from something
            coarser. The motivating case is privacy: an always-on sensor in a hospital ward
            or a street can be built to record only very coarse acoustic energy — say
            third-octave bands every 125 ms — from which speech cannot be reconstructed or
            overheard. That data is far too crude for a pretrained audio classifier, which
            expects standard mel frames every 10 ms. A mel transcoder is trained to upsample
            and warp the coarse measurement into the mel grid those classifiers already
            speak, usually with a teacher–student objective: it is rewarded for producing a
            spectrogram the downstream classifier reads correctly, not for matching pixels.
            It is a translator between two feature resolutions — a useful reminder that in
            an audio stack, “mel spectrogram” is not just a stage of processing, it is
            an <em>interface</em>.
          </p>
        </div>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 05 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">05 — the standard stack</span>An encoder, and three ways out</h2>
        <p>
          With the front end fixed, the rest of a speech system has a common shape: an{' '}
          <strong>encoder</strong> that turns the mel frames into a sequence of learned
          feature vectors, and a <strong>decoder</strong> that converts those into whatever
          you want out. Almost every well-known model is a choice of encoder (CNN, RNN/LSTM,
          Conformer, Transformer, state-space model) crossed with a choice of decoder.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="diagram">
          <svg viewBox="0 0 1000 360" role="img"
               aria-label="Standard speech architecture: front end, encoder, three decoder branches">
            <defs>
              <marker id="arHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#67718a" />
              </marker>
            </defs>
            <text x="20" y="24" className="hd">FRONT END (FIXED MATH)</text>
            <text x="430" y="24" className="hd">ENCODER (LEARNED)</text>
            <text x="700" y="24" className="hd">DECODERS (LEARNED)</text>

            <rect className="bx bxFront" x="20" y="150" width="110" height="62" rx="10" />
            <text x="75" y="176" className="lb" textAnchor="middle">waveform</text>
            <text x="75" y="194" className="sub" textAnchor="middle">16 kHz</text>

            <rect className="bx bxFront" x="160" y="150" width="110" height="62" rx="10" />
            <text x="215" y="176" className="lb" textAnchor="middle">STFT</text>
            <text x="215" y="194" className="sub" textAnchor="middle">512 / 256</text>

            <rect className="bx bxFront" x="300" y="150" width="110" height="62" rx="10" />
            <text x="355" y="170" className="lb" textAnchor="middle">mel + log</text>
            <text x="355" y="188" className="sub" textAnchor="middle">16–80 bands</text>
            <text x="355" y="204" className="sub" textAnchor="middle">62.5 fps</text>

            <rect className="bx bxCore" x="440" y="128" width="150" height="106" rx="12" />
            <text x="515" y="162" className="lb" textAnchor="middle">encoder</text>
            <text x="515" y="182" className="sub" textAnchor="middle">CNN · LSTM</text>
            <text x="515" y="198" className="sub" textAnchor="middle">Conformer</text>
            <text x="515" y="214" className="sub" textAnchor="middle">Transformer · SSM</text>

            <rect className="bx" x="700" y="40" width="270" height="76" rx="10" />
            <text x="716" y="66" className="lb">classification</text>
            <text x="716" y="86" className="sub">pool over time → linear → softmax</text>
            <text x="716" y="103" className="sub">→ “this clip is a 7”</text>

            <rect className="bx" x="700" y="143" width="270" height="76" rx="10" />
            <text x="716" y="169" className="lb">text (ASR)</text>
            <text x="716" y="189" className="sub">CTC or autoregressive decoder</text>
            <text x="716" y="206" className="sub">→ “seven”</text>

            <rect className="bx" x="700" y="246" width="270" height="94" rx="10" />
            <text x="716" y="272" className="lb">audio (TTS / voice conv.)</text>
            <text x="716" y="292" className="sub">mel head → vocoder</text>
            <text x="716" y="309" className="sub">HiFi-GAN · Vocos · iSTFT head</text>
            <text x="716" y="326" className="sub">→ a new waveform</text>

            <path className="ln" markerEnd="url(#arHead)" d="M130 181 H155" />
            <path className="ln" markerEnd="url(#arHead)" d="M270 181 H295" />
            <path className="ln" markerEnd="url(#arHead)" d="M410 181 H435" />
            <path className="ln" markerEnd="url(#arHead)" d="M590 181 C640 181 640 78 695 78" />
            <path className="ln" markerEnd="url(#arHead)" d="M590 181 H695" />
            <path className="ln" markerEnd="url(#arHead)" d="M590 181 C640 181 640 293 695 293" />

            <text x="480" y="300" className="sub" textAnchor="middle">the same features feed all three</text>
            <text x="480" y="318" className="sub" textAnchor="middle">— only the head and the loss change</text>
          </svg>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 6 — the conventional pipeline.</b> The front end is fixed arithmetic
          with no learned parameters. Everything to its right is trained, and what you train
          it on is set entirely by the decoder you attach.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>What the training data has to be</h3>
        <table>
          <thead>
            <tr><th>Goal</th><th>Training pairs</th><th>Loss</th></tr>
          </thead>
          <tbody>
            <tr><td>Classification</td><td>clip → one label (<code>&quot;7&quot;</code>)</td><td>cross-entropy</td></tr>
            <tr><td>Speech → text</td><td>clip → transcript, <em>no</em> per-frame alignment needed</td><td>CTC, or teacher-forced cross-entropy</td></tr>
            <tr><td>Text → speech</td><td>transcript → clip, same corpus read the other way</td><td>mel regression + vocoder losses</td></tr>
            <tr><td>Speech → speech</td><td>source clip → target clip (denoised, or another voice)</td><td>reconstruction + multi-resolution STFT</td></tr>
          </tbody>
        </table>

        <h3>Getting back out to audio: the phase problem</h3>
        <p>
          Classification and transcription end at a small output. Generating audio does not,
          and it runs into a wall that is worth understanding, because it explains why half
          the field exists.
        </p>
        <p>
          The STFT produces complex numbers: a <strong>magnitude</strong> (how much of this
          frequency) and a <strong>phase</strong> (where in its cycle that frequency is at
          this instant). A spectrogram displays magnitude only; the mel filterbank then
          throws away even the fine frequency detail. The <strong>inverse STFT
          (iSTFT)</strong> — inverse FFT per frame, then overlap-add the frames back
          together — reconstructs the waveform perfectly, but only if you give it{' '}
          <em>both</em> parts. Hand it magnitudes with no phase and the overlapping frames
          fight each other instead of adding up, and you get a smeared, metallic buzz.
        </p>
        <p>So a generative audio model must supply the missing phase. Three eras of answers:</p>
        <ul>
          <li>
            <strong>Griffin–Lim (algorithmic).</strong> Guess a phase, iSTFT, re-STFT, keep
            the target magnitudes and the newly implied phase, repeat. Converges to
            something playable and famously robotic. <em>Where you have heard it:</em> the
            original <a href={'https://arxiv.org/abs/1703.10135'} target="_blank" rel="noopener noreferrer">Tacotron</a> (2017)
            shipped with Griffin–Lim, which is exactly why first-generation neural TTS
            demos had that ringing, underwater timbre — and why{' '}
            <a href="https://github.com/librosa/librosa" target="_blank" rel="noopener noreferrer">librosa</a>’s{' '}
            <code>griffinlim</code> is still the two-line baseline everyone tries first.
          </li>
          <li>
            <strong>Neural vocoders (the modern default).</strong> A network trained on
            thousands of hours of real speech maps mel frames straight to samples. It never
            “solves” for phase; it has learned what real glottal pulses, real fricative
            noise, and real micro-jitter look like. <em>Where you have heard them:</em>{' '}
            <a href="https://arxiv.org/abs/1609.03499" target="_blank" rel="noopener noreferrer">WaveNet</a>{' '}
            (2016) predicted one sample at a time — stunning, and far too slow, so{' '}
            <a href="https://arxiv.org/abs/1712.05884" target="_blank" rel="noopener noreferrer">Tacotron 2</a>{' '}
            paired it with a mel decoder;{' '}
            <a href="https://arxiv.org/abs/2010.05646" target="_blank" rel="noopener noreferrer">HiFi-GAN</a>{' '}
            (2020) made GAN vocoding fast and clean enough to become the default, and it is
            the vocoder inside{' '}
            <a href="https://huggingface.co/hexgrad/Kokoro-82M" target="_blank" rel="noopener noreferrer">Kokoro</a>{' '}
            and <a href="https://arxiv.org/abs/2306.07691" target="_blank" rel="noopener noreferrer">StyleTTS 2</a>;{' '}
            <a href="https://arxiv.org/abs/2206.04658" target="_blank" rel="noopener noreferrer">BigVGAN</a>{' '}
            scaled it to universal, any-voice audio;{' '}
            <a href="https://arxiv.org/abs/2009.09761" target="_blank" rel="noopener noreferrer">DiffWave</a> and{' '}
            <a href="https://arxiv.org/abs/2009.00713" target="_blank" rel="noopener noreferrer">WaveGrad</a>{' '}
            sculpt noise into a waveform by diffusion; and{' '}
            <a href="https://arxiv.org/abs/2306.00814" target="_blank" rel="noopener noreferrer">Vocos</a>{' '}
            predicts STFT coefficients — magnitude <em>and</em> phase — then lets a single
            iSTFT do the synthesis, which is fast enough to be the interesting compromise.
          </li>
          <li>
            <strong>Multi-resolution spectral losses.</strong> Whatever the generator,
            training compares the output to the target through several STFTs at once — short
            windows to police clicks and transients, long windows to police pitch and
            vowels. <em>Where it comes from:</em>{' '}
            <a href="https://arxiv.org/abs/1910.11480" target="_blank" rel="noopener noreferrer">Parallel WaveGAN</a>{' '}
            (2019) introduced the multi-resolution STFT loss that nearly every vocoder since
            has adopted, including HiFi-GAN’s mel loss and{' '}
            <a href="https://arxiv.org/abs/2107.03312" target="_blank" rel="noopener noreferrer">SoundStream</a>/
            <a href="https://arxiv.org/abs/2210.13438" target="_blank" rel="noopener noreferrer">EnCodec</a>’s
            spectral reconstruction terms; the differentiable-DSP line (
            <a href="https://arxiv.org/abs/2001.04643" target="_blank" rel="noopener noreferrer">DDSP</a>) leans on the
            same idea.
          </li>
        </ul>

        <h3>Text-to-speech is not simply speech-to-text backwards</h3>
        <p>
          Structurally it mirrors: text encoder → acoustic decoder → vocoder → wave. In
          difficulty it does not. Recognition is <em>many-to-one</em>: a thousand different
          performances of “seven” must collapse onto one string, so the model’s job is to
          throw variation away. Synthesis is <em>one-to-many</em>: from five letters the
          model must invent a speaker, a pitch contour, a speaking rate, the emphasis, and
          the breaths. Nothing in the input says which of the infinitely many correct
          readings to produce, which is why modern TTS spends its parameters on duration
          predictors, style/speaker embeddings, and generative decoders.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 06 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">06 — a different core</span>What if the middle box were physics?</h2>
        <p>
          Everything above treats the encoder as a stack of matrix multiplications. Here is
          the alternative <strong>Project Resonant</strong> is built to test: replace it
          with a <strong>population of coupled oscillators</strong>, and let the audio drive
          them.
          {/* repo is not public yet — restore when it is:
              <a href={REPO} target="_blank" rel="noopener noreferrer">Project Resonant</a> */}
        </p>
        <p>
          The motivation is not aesthetic. Speech <em>is</em> oscillation — vocal folds
          cycling, resonances ringing, syllables at 4–8 Hz. A representation whose internal
          state is also a set of phases and frequencies starts closer to its data than a
          general-purpose matrix stack does. And the entire history of the signal lives in a
          fixed-size state — the phases — instead of a context window that grows with time.
        </p>

        <h3>The stadium crowd</h3>
        <p>
          Imagine a stadium at a concert, everyone holding their phone with the light on,
          each person swinging it in a slow windmill while their favourite singer plays.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
          <Image
            src="/resonant/stadium.png"
            alt="A concert stadium seen from outside and above, roof open, a lit stage at the far end, every seat drawn as a phone light coloured by its phase, with a bright wave sweeping around the near side"
            width={1200}
            height={680}
            className="h-auto w-full"
            unoptimized
          />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 7 — the whole model, in one picture.</b> Every seat is an oscillator and
          every colour is where that phone’s light is pointing. The bright band sweeping the
          near side is the wave, and the stage at the far end is the audio driving it.
          Nobody is going anywhere and the seating chart never changes: what travels is the{' '}
          <em>timing relationship</em> between neighbours — which is exactly what the
          coupling term computes, and exactly what the readout measures.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <ul>
          <li>Where each person’s <strong>light is pointing</strong> right now is that oscillator’s phase, θ. It swings around and around; straight up at 0 and at 2π is the same place in the circle.</li>
          <li>Everyone has a preferred <strong>swing tempo</strong>, ω — the speed they would settle into if nobody else were there.</li>
          <li>People glance at their neighbours and adjust: the <strong>coupling</strong>. You speed up or slow down depending on whether the lights beside you are ahead of yours or behind it.</li>
          <li>The <strong>music</strong> from the stage pushes the whole section on the beat: the <strong>drive</strong>. This is where the audio enters — a loud low note leans on one part of the crowd, a bright cymbal on another.</li>
          <li>A gentle tendency to let your arm drop keeps the whole thing from running away: the <strong>pinning</strong>.</li>
          <li>The <strong>seating chart</strong> never changes. Nobody swaps seats — only the wave of light moves through them.</li>
        </ul>
        <p>
          Written down, that is the <strong>Kuramoto model</strong>, one of the most studied
          equations in physics — it is how fireflies end up flashing together and how
          metronomes on a shared board come into step. Each oscillator updates its phase
          like this:
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="equation !border-0 !bg-transparent !p-0 !pb-1">
          dθ<sub>i</sub>/dt = <span className="tDrift">ω<sub>i</sub></span>{' + '}
          <span className="tCouple">Σ<sub>j</sub> K(i−j) · sin(θ<sub>j</sub> − θ<sub>i</sub>)</span>{' − '}
          <span className="tPin">λ · sin(θ<sub>i</sub>)</span>{' + '}
          <span className="tDrive">F<sub>i</sub>(t)</span>
          </div>
          <div className="mt-6 grid gap-4 border-t border-zinc-700/60 pt-6 text-[15px] leading-relaxed text-zinc-300 [&>div]:grid [&>div]:grid-cols-[136px_1fr] [&>div]:items-start [&>div]:gap-4 [&_b]:font-semibold [&_b]:text-white [&_span:first-child]:font-mono [&_span:first-child]:text-xl [&_span:first-child]:font-semibold">
          <div>
            <span className="tDrift">ω</span>
            <span><b>Own tempo.</b> Every oscillator has a natural frequency it would keep on its own. In this demo they are laid out deliberately: each row of the grid is tuned to one band of the speech envelope, from about 0.4 Hz at the bottom to 6 Hz at the top.</span>
          </div>
          <div>
            <span className="tCouple">K, sin(Δθ)</span>
            <span><b>Peers.</b> The pull toward agreement, and the only place the model can learn structure. It depends on the phase <em>difference</em>, so it is a relationship, not a value — that is what makes the population synchronize rather than merely add up.</span>
          </div>
          <div>
            <span className="tPin">λ</span>
            <span><b>Pinning.</b> A pull toward a rest phase. Without it the system is marginally stable and gradients through long sequences explode; with it, memory of the past decays at a controllable rate.</span>
          </div>
          <div>
            <span className="tDrive">F(t)</span>
            <span><b>The audio.</b> Each mel band’s loudness at this instant, injected into its own row of oscillators. Loud band, hard shove.</span>
            </div>
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 8 — the whole core, in one line.</b> Compare with a transformer layer:
          there is no attention matrix, no feed-forward block, no layer norm. There is a
          tempo, a neighbourhood rule, a brake, and an input.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <p>
          Coupling strength is the interesting dial. Too weak and every oscillator ignores
          the others — a bag of independent filters. Too strong and the entire population
          locks into one rigid clump that reports nothing except “loud”. The useful regime
          is in between, where parts of the field synchronize and parts do not, and{' '}
          <em>which</em> parts depends on what it is hearing.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="panel">
          <div className="panelTitle">
            <span>toy: 24 oscillators on a ring</span>
            <em id="toyLabel">K = 0.00 · R = —</em>
          </div>
          <div className="canvasFrame"><canvas id="toyCanvas" style={{ height: 210 }} /></div>
          <div className="dial" style={{ marginTop: 12 }}>
            <label htmlFor="toyK">coupling K <b id="toyKVal">0.00</b></label>
            <input className="slider" type="range" id="toyK" min="0" max="300" defaultValue="0" />
          </div>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 9 — synchronization, from nothing to total.</b> 24 oscillators with
          different natural tempos, drawn as dots on their shared circle. At K = 0 they
          smear around it forever. Push K up and they gather into a clump. The arrow is the{' '}
          <strong>order parameter R</strong>: the average of all the phases treated as unit
          vectors. R ≈ 0 means scattered, R ≈ 1 means locked together — and R is one of the
          numbers the readout reads.
        </figcaption>
      </figure>

      <Prose className={TYPE}>
        <h3>Why a torus</h3>
        <p>
          The oscillators are not a loose bag; they sit on a 16 × 16 grid, and coupling
          depends only on the <em>offset</em> between two cells, not their absolute position
          — the same neighbourhood rule everywhere, which is exactly what makes a
          convolution a convolution. Rows are frequency bands (mel band <em>b</em> drives
          grid row <em>b</em>, so the grid inherits the ear’s layout); columns are a second
          dimension the dynamics can spread into.
        </p>
        <p>
          Both axes wrap: the last row’s neighbour is the first row, the last column’s
          neighbour is the first column. A grid with both edges glued is a{' '}
          <strong>torus</strong>. Two reasons it is worth the trouble. First, no edges means
          no special cases — every oscillator has an identical neighbourhood, so one small
          kernel describes the whole field. Second, a translation-invariant kernel on a
          periodic grid is a circular convolution, which is a <em>pointwise multiply</em> in
          Fourier space: coupling all 256 oscillators to all 256 others costs one FFT rather
          than a 256 × 256 matrix. The physics of the configuration on this page is about
          2,000 numbers.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
          <Image
            src="/resonant/torus.png"
            alt="A torus drawn as a lattice of dots, each coloured by its phase, with a travelling wave wrapping around both the ring and the tube"
            width={1200}
            height={720}
            className="h-auto w-full"
            unoptimized
          />
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 10 — the field on the shape it lives on.</b> The same phase colours as the
          crowd, now wrapped onto the surface the grid actually forms. Rows run around the
          tube — that is the frequency axis, low bands to high — and columns run around the
          ring. Follow any row far enough and you arrive back where you started; the same is
          true of any column. That is what “periodic in both axes” buys: no oscillator is on
          an edge, so one small kernel describes every neighbourhood in the field, and the
          whole coupling step collapses into a single FFT.
        </figcaption>
      </figure>

      <Prose className={TYPE}>

        <h3>Reading a physical system</h3>
        <p>
          You cannot feed phases to a classifier directly — θ = 0.01 and θ = 6.27 are
          neighbours on the circle but look far apart as numbers. So the readout takes{' '}
          <strong>sin θ and cos θ</strong>, which are smooth around the wrap, and summarizes
          each oscillator over the clip with four numbers: mean sin and mean cos (where it
          sat) and the mean sin and cos of its per-frame phase <em>step</em> (how fast it
          turned — an oscillator captured by the stimulus reports the stimulus’s rhythm, a
          free one reports its own). With 4 channels × 256 cells that is 4,096 features, and
          a plain linear layer on top.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="diagram">
          <svg viewBox="0 0 1000 320" role="img" aria-label="Oscillator core architecture">
            {/* markers are per-SVG: referencing the first diagram's marker works in
                most browsers but is not something to rely on */}
            <defs>
              <marker id="arHead2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#67718a" />
              </marker>
            </defs>
            <text x="20" y="24" className="hd">IDENTICAL FRONT END</text>
            <text x="352" y="24" className="hd">PHYSICS CORE (REPLACES THE ENCODER)</text>
            <text x="800" y="24" className="hd">SAME HEADS</text>

            <rect className="bx" x="20" y="120" width="120" height="70" rx="10" />
            <text x="80" y="150" className="lb" textAnchor="middle">STFT + mel</text>
            <text x="80" y="169" className="sub" textAnchor="middle">16 bands</text>

            <rect className="bx" x="170" y="120" width="140" height="70" rx="10" />
            <text x="240" y="145" className="lb" textAnchor="middle">drive map</text>
            <text x="240" y="163" className="sub" textAnchor="middle">band b → row b</text>
            <text x="240" y="179" className="sub" textAnchor="middle">× gain</text>

            <rect className="bx bxCore" x="352" y="72" width="286" height="176" rx="14" />
            <text x="495" y="102" className="lb" textAnchor="middle">4 × (16 × 16) oscillators</text>
            <text x="495" y="126" className="sub" textAnchor="middle">θ ← θ + dt · (ω + coupling − pinning + drive)</text>
            <text x="495" y="148" className="sub" textAnchor="middle">coupling = circular convolution (one FFT)</text>
            <text x="495" y="170" className="sub" textAnchor="middle">periodic in both axes = a torus</text>
            <text x="495" y="200" className="subHot" textAnchor="middle">state θ carries over to the next frame</text>
            <text x="495" y="218" className="subHot" textAnchor="middle">— fixed-size streaming memory</text>

            <rect className="bx" x="680" y="120" width="130" height="70" rx="10" />
            <text x="745" y="145" className="lb" textAnchor="middle">readout</text>
            <text x="745" y="163" className="sub" textAnchor="middle">sin θ, cos θ</text>
            <text x="745" y="179" className="sub" textAnchor="middle">+ phase steps</text>

            <rect className="bx" x="848" y="78" width="132" height="52" rx="10" />
            <text x="914" y="102" className="lb" textAnchor="middle">softmax</text>
            <text x="914" y="119" className="sub" textAnchor="middle">digit 0–9</text>

            <rect className="bx" x="848" y="142" width="132" height="52" rx="10" />
            <text x="914" y="166" className="lb" textAnchor="middle">CTC</text>
            <text x="914" y="183" className="sub" textAnchor="middle">text</text>

            <rect className="bx" x="848" y="206" width="132" height="52" rx="10" />
            <text x="914" y="230" className="lb" textAnchor="middle">mel head</text>
            <text x="914" y="247" className="sub" textAnchor="middle">→ vocoder</text>

            <path className="ln" markerEnd="url(#arHead2)" d="M140 155 H165" />
            <path className="ln" markerEnd="url(#arHead2)" d="M310 155 H347" />
            <path className="ln" markerEnd="url(#arHead2)" d="M638 155 H675" />
            <path className="ln" markerEnd="url(#arHead2)" d="M810 155 C830 155 830 104 843 104" />
            <path className="ln" markerEnd="url(#arHead2)" d="M810 155 H843" />
            <path className="ln" markerEnd="url(#arHead2)" d="M810 155 C830 155 830 232 843 232" />
            <path className="lnHot" markerEnd="url(#arHead2)" d="M600 248 C600 292 400 292 400 252" />
            <text x="500" y="306" className="subHot" textAnchor="middle">phases persist frame to frame — the recurrence</text>
          </svg>
        </div>
        <figcaption className={CAPTION}>
          <b>Figure 11 — same stack, different middle.</b> The front end and the output heads
          are deliberately the most boring possible choices and are shared with the
          conventional control models, so that any difference in results is attributable to
          the core and not to the plumbing around it.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 07 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">07 — watch it run</span>The whole pipeline, live</h2>
        <p>
          Below, everything on this page runs end to end. Pick a digit and press play: the
          clip is analyzed into mel bands, the bands are injected into the oscillator field,
          61 frames of physics are integrated, and the linear readout reports what it thinks
          it heard — all in your browser, in about the time it takes to blink.
        </p>
        <p>
          One thing to be clear about before you look: <strong>the physics here is not
          trained</strong>. The coupling kernel is a random draw that was never touched by
          gradient descent, the natural frequencies were designed by hand, and the only
          fitted part is the final linear layer. On held-out speakers this configuration
          gets <b id="accInline">—</b> of ten-way digits right. That is a statement about
          how much structure raw oscillator dynamics impose on their input — and section 08
          runs the control that says how much of it the <em>coupling</em> deserves credit
          for. It is not a claim that any of this beats a trained network.
        </p>
      </Prose>

      <figure className="my-10">
        <div className="pipelineStrip" id="pipelineStrip">
          <div className="stage" data-stage="0">waveform</div>
          <div className="stage" data-stage="1">STFT</div>
          <div className="stage" data-stage="2">mel bands</div>
          <div className="stage" data-stage="3">drive</div>
          <div className="stage" data-stage="4">oscillator field</div>
          <div className="stage" data-stage="5">readout</div>
        </div>
        <ResonantConsole />
        <figcaption className={CAPTION}>
          <b>Figure 12 — the live console.</b> Three things reward watching. <b>One:</b>{' '}
          during silence the field still turns, each row at its own tempo — slow at the
          bottom, quick at the top. <b>Two:</b> when the word arrives the driven rows lurch,
          the pattern reorganizes, and the order-parameter traces swing. <b>Three:</b> the
          readout usually commits well before the clip ends, then holds. Every dial is real
          physics, but the readout was fitted at one setting and never refits, so moving a
          dial hands it a system it has never seen — that is what the badge means, and why
          predictions fall apart quickly. What that does <em>not</em> establish is how much
          the coupling was contributing; the next section prices that properly.
        </figcaption>
      </figure>

      {/* ─────────────────────────────────────────────────────────── 08 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">08 — this is just the beginning</span>What this shows, and what it doesn’t</h2>
        <p>
          Spoken digits are an easy task with a long history — they are the “hello world” of
          speech, and a physical spin-torque oscillator hit 99.6% on a comparable benchmark
          back in 2017. A high number here is not evidence that oscillator cores beat
          transformers at speech. What the demo does show, concretely:
        </p>
        <ul>
          <li><strong>Untrained dynamics carry usable structure.</strong> No gradient touched the kernel. The audio drives the field, the field organizes, and a linear probe reads the digit off the result.</li>
          <li><strong>The state is fixed-size and streaming.</strong> 4 × 256 phases at every frame, whatever the length of the input. No cache grows.</li>
          <li><strong>The whole model is tiny.</strong> The physics is roughly 2,000 numbers, and it simulates a second of audio in a browser tab in a few dozen milliseconds.</li>
        </ul>

        <h3>How much of it is the synchronization?</h3>
        <p>
          There are two different machines hiding in that description, and it is worth
          separating them. One is a <strong>bank of independent resonators</strong>: 1,024
          oscillators, each tuned to a frequency band, each shoved by its own slice of the
          audio, none of them aware of any other. That is a perfectly good feature
          extractor, and it is not a new idea — it is what a filterbank does. The other is
          the <strong>coupled field</strong>: the same oscillators, now allowed to pull on
          their neighbours, so what any one of them does depends on what the ones around it
          are doing. Only the second one is a synchronization model.
        </p>
        <p>
          The difference between them is a single number — the coupling kernel. Set it to
          zero and the neighbours stop listening to each other; everything else stays
          identical. Fit the same linear readout on each and you can price the coupling
          directly:
        </p>
        <table>
          <thead>
            <tr><th>Field</th><th>Readout</th><th>Test accuracy</th></tr>
          </thead>
          <tbody>
            <tr><td>coupled — neighbours interact</td><td>fitted on this field</td><td><b>96.2%</b></td></tr>
            <tr><td>uncoupled (K = 0) — a plain resonator bank</td><td>refitted on this field</td><td><b>94.2%</b></td></tr>
            <tr><td>uncoupled (K = 0)</td><td>the coupled field’s readout, unchanged</td><td>17.4%</td></tr>
          </tbody>
        </table>
        <p>
          Two points. On spoken digits, letting the oscillators talk to each other is worth
          about two points over letting them ring independently — real, repeatable across
          seeds, and much smaller than the headline number would suggest. Most of the work
          is being done by the resonator bank and a generous linear readout.
        </p>
        <p>
          The third row is a different kind of statement, and it is the one most likely to
          be misread. It is not a measurement of the coupling; it is what happens when you
          change the machine and keep the old readout. The linear layer was fitted to one
          physical system and handed a different one, so it fails — the way a key fails in
          a lock it was not cut for. The physics is fine. The translation is stale.
        </p>
        <p>
          Why does a two-point gap still matter? Because of <em>what</em> is being compared.
          A resonator bank is a fixed function: each oscillator's response is decided the
          moment you choose its frequency. A coupled field has a shape that can be changed
          — the kernel says who listens to whom and how strongly, and that shape is what
          makes patterns like travelling waves and partial synchronization possible at all.
          Here that shape is a random draw that no gradient ever touched, and it still buys
          two points. The interesting question is not whether an arbitrary coupling helps a
          little; it is what a good one does.
        </p>
        <p>
          There are two obvious ways to find out, and both are open. <strong>Train
          it:</strong> the kernel is a small, differentiable parameter set, so gradient
          descent can shape who couples to whom instead of leaving it to chance.{' '}
          <strong>Change the physics:</strong> Kuramoto's <code>sin(θⱼ − θᵢ)</code> is only
          the simplest way for two oscillators to interact. Add a phase lag and you get
          travelling waves; add a second harmonic and the population splits into clusters
          instead of one clump; amplitude-carrying oscillators can express loudness as well
          as timing. Each is a different coupling law over the same field, and each is being
          worked through with the same discipline as everything else here — a
          parameter-matched control and a bar written down first.
        </p>

        <h3>Where this goes</h3>
        <p>
          The open question is whether the wave-physics prior is a genuinely better
          architecture for wave-shaped input and output — real-time speech in and out of one
          interruptible, context-carrying core — or whether it is a beautiful idea that a
          boring stack of matrices beats at every size. The repository is built so that the
          hypothesis can fail cleanly: parameter-matched controls, frozen baselines,
          immutable training logs, and verdicts written before the runs. That work is
          ongoing, and the interesting part is still ahead.
        </p>
      </Prose>

      {/* ─────────────────────────────────────────────────────────── 09 ─── */}
      <Prose className={TYPE}>
        <h2><span className="num">09 — go deeper</span>The code, and the prior art</h2>
        <p>
          Everything on this page — the front end, the oscillator core, the readout, and the
          ten recordings — comes out of a research repository that holds the hypothesis, the
          architecture, every experiment log, and the results that refuted my own
          expectations. It is getting a clean-up pass before it goes public; the link will
          land here when it does.
        </p>
        {/* repo is not public yet — restore this button when it is:
        <p style={{ marginTop: '1.5rem' }}>
          <a className="action primary" href={REPO} target="_blank" rel="noopener noreferrer"
             style={{ textDecoration: 'none', display: 'inline-block' }}>
            Project Resonant on GitHub →
          </a>
        </p> */}

        <h3>Prior art worth reading</h3>
        <div className="not-prose mt-6 rounded-2xl border border-zinc-200 bg-zinc-100/60 p-6 dark:border-zinc-700/50 dark:bg-zinc-800/40">
          <ul className="space-y-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 [&_a]:text-violet-500 dark:[&_a]:text-violet-400">
            <li>
              <a href="https://en.wikipedia.org/wiki/Kuramoto_model" target="_blank" rel="noopener noreferrer" className="font-medium">The Kuramoto model</a>{' — '}the synchronization dynamics at the core
            </li>
            <li>
              <a href="https://arxiv.org/abs/2410.13821" target="_blank" rel="noopener noreferrer" className="font-medium">AKOrN</a>{' — '}trained Kuramoto neurons for vision and reasoning
            </li>
            <li>
              <a href="https://arxiv.org/abs/2010.00951" target="_blank" rel="noopener noreferrer" className="font-medium">coRNN</a>{' — '}oscillator ODEs as sequence models
            </li>
            <li>
              <a href="https://arxiv.org/abs/2410.03943" target="_blank" rel="noopener noreferrer" className="font-medium">LinOSS</a>{' — '}oscillatory state-space models for long sequences
            </li>
            <li>
              <a href="https://proceedings.mlr.press/v202/keller23a.html" target="_blank" rel="noopener noreferrer" className="font-medium">Neural Wave Machines</a>{' — '}traveling waves in recurrent states
            </li>
            <li>
              <a href="https://www.nature.com/articles/nature23011" target="_blank" rel="noopener noreferrer" className="font-medium">Spintronic oscillator reservoir</a>{' — '}spoken digits on one physical oscillator
            </li>
            <li>
              <a href="https://arxiv.org/abs/2306.00814" target="_blank" rel="noopener noreferrer" className="font-medium">Vocos</a>{' — '}the fast iSTFT-head vocoder
            </li>
            <li>
              <a href="https://unconv.ai/blog/introducing-un-0-generating-images-with-coupled-oscillators/" target="_blank" rel="noopener noreferrer" className="font-medium">Un-0</a>{' — '}image generation from coupled oscillators
            </li>
            <li>
              <a href="https://github.com/soerenab/AudioMNIST" target="_blank" rel="noopener noreferrer" className="font-medium">AudioMNIST</a>{' — '}the spoken-digit corpus every clip on this page comes from
            </li>
          </ul>
        </div>
      </Prose>

      {/* the fine print, last — small, tight, and unmissable for anyone who wants it */}
      <aside className="mt-16 rounded-r-xl border-l-2 border-amber-500 bg-amber-500/5 px-5 py-4 dark:border-amber-300 dark:bg-amber-300/5">
        <h2 className="font-mono text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase dark:text-amber-300">
          Caveats, stated plainly
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed text-zinc-600 marker:text-amber-500/60 dark:text-zinc-400">
          <li>
            The accuracy quoted on this page is measured on a speaker-disjoint split, with
            the readout fitted on the training speakers only. It is <em>not</em> a
            registered experimental verdict, and it deliberately skips a protocol step the
            project’s real digit experiments use — squeezing every architecture’s features
            through a common 72-dimensional projection so that readout capacity cannot
            masquerade as dynamics. Run this same frozen core through that stricter protocol
            and it scores <b>67.3%</b> rather than 96.2%: a large share of the headline
            number is the width of the readout, not the physics.
          </li>
          <li>
            Classification is the easiest of the three decoder paths. Speech-to-text and
            text-to-speech on this core are both being explored right now, with more
            experiments to come — and whatever they return, positive or negative, gets
            written down.
          </li>
          <li>
            A demo is not a benchmark. Every claim that matters is settled by a run against
            a parameter-matched conventional control through identical scaffolding, with the
            decision rule written down beforehand.
          </li>
        </ul>
      </aside>
    </>
  )
}
