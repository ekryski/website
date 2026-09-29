/**
 * A live console: markup only.
 *
 * Rendered twice, for the model explorer (prefix "m") and the drive-signal
 * explorer (prefix "d"). Every id is `${prefix}-<name>` and is a contract with
 * src/lib/untrained/console.js, which mounts the canvases and wires the
 * controls once React has rendered this tree. The option lists are built by
 * that module from the export's manifest, so they can never name a config the
 * export did not produce.
 */
export function ModelConsole({ prefix, drive = false }: { prefix: string; drive?: boolean }) {
  const id = (name: string) => `${prefix}-${name}`
  return (
    <div className="console" id={id('root')}>
      <div className="pipelineStrip" id={id('strip')} aria-hidden="true">
        <div className="stage">waveform</div>
        <div className="stage">{drive ? 'pathway' : 'mel bands'}</div>
        <div className="stage">drive rows</div>
        <div className="stage" id={id('stripArm')}>arm</div>
        <div className="stage">the read</div>
        <div className="stage">readout</div>
      </div>

      <div className="stack">
        <div className="panel">
          <div className="panelTitle">
            <span id={id('viewTitle')}>the network on its torus</span>
            <em id={id('viewTag')}>channel 1 of 4</em>
          </div>
          <div className="viewBox">
            <canvas id={id('view3d')} className="view3d" />
            <canvas id={id('view2d')} className="view2d" hidden />
          </div>
          <div className="chanRow" id={id('chanRow')}>
            {[0, 1, 2, 3].map((c) => (
              <button type="button" className="action small" data-chan={c} key={c}>ch {c + 1}</button>
            ))}
            <button type="button" className="action small" id={id('spin')}>⟲ spin</button>
          </div>
          <p className="viewNote" id={id('viewNote')} />
        </div>

        <div className="panel">
          <div className="panelTitle">
            <span>{drive ? 'choose a reservoir and a pathway' : 'choose a model'}</span>
            <em id={id('fitTag')} className="tag ok">in the paper</em>
          </div>
          <div className="controlGrid">
            <label className="field">
              <span>model</span>
              <select className="action" id={id('model')} aria-label="model" />
            </label>
            {drive && (
              <div className="field">
                <span>input pathway</span>
                <div className="seg" id={id('pathway')} role="group" aria-label="input pathway" />
              </div>
            )}
            <label className="field" id={id('fnField')}>
              <span>coupling function</span>
              <select className="action" id={id('fn')} aria-label="coupling function" />
            </label>
            {!drive && (
              <label className="field" id={id('geoField')}>
                <span>lattice geometry</span>
                <select className="action" id={id('geo')} aria-label="lattice geometry" />
              </label>
            )}
            <div className="field">
              <span>input gain</span>
              <div className="seg" id={id('gain')} role="group" aria-label="input gain" />
            </div>
            <div className="field">
              <span>noise</span>
              <div className="seg" id={id('noise')} role="group" aria-label="noise level" />
            </div>
          </div>
          <p className="controlNote" id={id('controlNote')} />
          <div className="sourceRow">
            <select className="action" id={id('clip')} aria-label="choose a recording" />
            <button type="button" className="action micBtn" id={id('mic')}
                    aria-label="record a digit with your microphone">🎤 record</button>
          </div>
          <div className="micRow">
            <div className="micMeter" aria-hidden="true"><i id={id('micLevel')} /></div>
            <span id={id('micStatus')} role="status">or record yourself saying a digit</span>
          </div>
          <div className="dial" style={{ marginTop: 12 }}>
            <label htmlFor={id('speed')}>playback speed <b id={id('speedVal')}>1.0×</b></label>
            <input className="slider" type="range" id={id('speed')} min="10" max="100" defaultValue="100" />
          </div>
          <div className="runRow">
            <span className="progress" id={id('progress')} role="status" />
            <button type="button" className="action primary toggle" id={id('play')}>▶ Play &amp; run</button>
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="panel">
          <div className="panelTitle">
            <span id={id('inputTitle')}>input</span>
            <em id={id('time')}>0.00 s</em>
          </div>
          <div className="canvasFrame"><canvas id={id('wave')} style={{ height: 64 }} /></div>
          <div className="canvasFrame" style={{ marginTop: 8 }}>
            <canvas id={id('rows')} style={{ height: 96 }} />
          </div>
          <div className="traceRow">
            <div className="canvasFrame"><canvas id={id('trace')} style={{ height: 86 }} /></div>
            <div className="canvasFrame"><canvas id={id('drive')} style={{ height: 86 }} /></div>
          </div>
          <div className="panelTitle" style={{ margin: '8px 0 0' }}>
            <span id={id('traceTitle')}>order parameter R · drive rows now</span>
            <em id={id('traceScale')}>—</em>
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">
            <span>readout · ten digit scores</span>
            <em id={id('verdict')}>—</em>
          </div>
          <div id={id('bars')} className="scoreBars" />
          <div className="windowStrip" id={id('windows')} aria-hidden="true" />
          <div className="metrics" style={{ marginTop: 12 }}>
            <div className="metric"><span>source</span><b id={id('mTruth')}>—</b></div>
            <div className="metric"><span>detected</span><b id={id('mPred')}>—</b></div>
            <div className="metric"><span>accuracy in the paper</span><b id={id('mRecord')}>—</b></div>
            <div className="metric"><span>run time</span><b id={id('mMs')}>—</b></div>
          </div>
          <p className="recordNote" id={id('recordNote')} />
        </div>

        <div className="panel" id={id('gridsPanel')}>
          <div className="panelTitle">
            <span id={id('gridsTitle')}>all four channels, flattened</span>
            <em id={id('gridsTag')}>hue = phase</em>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((c) => (
              <div className="canvasFrame" key={c}>
                <canvas className="fieldGrid" data-ch={c} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
