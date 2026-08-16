/**
 * Section 07's live console — markup only.
 *
 * Every id here is a contract with src/lib/resonant/console.js, which mounts
 * the canvases and wires the controls once React has rendered this tree.
 */
export function ResonantConsole() {
  return (
    <div className="console">
      <div className="stack">
        <div className="panel">
          <div className="panelTitle">
            <span>the field on its torus</span>
            <em id="chanLabel">channel 1 of 4</em>
          </div>
          <canvas id="torusCanvas" style={{ height: 340 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button type="button" className="action" data-chan="0">ch 1</button>
            <button type="button" className="action" data-chan="1">ch 2</button>
            <button type="button" className="action" data-chan="2">ch 3</button>
            <button type="button" className="action" data-chan="3">ch 4</button>
            <button type="button" className="action" id="spinBtn">⟲ auto-spin</button>
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">
            <span>turn the dials</span>
            <em id="dialTag" className="tag ok">as fitted</em>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="dial">
              <label htmlFor="gainDial">drive gain <b id="gainVal">2.0</b></label>
              <input className="slider" type="range" id="gainDial" min="0" max="60" defaultValue="20" />
            </div>
            <div className="dial">
              <label htmlFor="dampDial">pinning λ <b id="dampVal">0.50</b></label>
              <input className="slider" type="range" id="dampDial" min="0" max="200" defaultValue="50" />
            </div>
            <div className="dial">
              <label htmlFor="coupDial">coupling × <b id="coupVal">1.00</b></label>
              <input className="slider" type="range" id="coupDial" min="0" max="300" defaultValue="100" />
            </div>
            <div className="dial">
              <label htmlFor="speedDial">playback speed <b id="speedVal">1.0×</b></label>
              <input className="slider" type="range" id="speedDial" min="10" max="100" defaultValue="100" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="action primary" id="livePlayBtn">▶ Play &amp; run</button>
            <button type="button" className="action" id="resetDials">reset</button>
            <select className="action" id="consoleDigit" aria-label="choose which digit to run" />
          </div>
        </div>
      </div>

      <div className="stack">
        <div className="panel">
          <div className="panelTitle">
            <span>input</span>
            <em id="timeLabel">0.00 s</em>
          </div>
          <div className="canvasFrame"><canvas id="liveWaveCanvas" style={{ height: 70 }} /></div>
          <div className="canvasFrame" style={{ marginTop: 8 }}>
            <canvas id="liveMelCanvas" style={{ height: 96 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 74px', gap: 10, marginTop: 8 }}>
            <div className="canvasFrame"><canvas id="rCanvas" style={{ height: 86 }} /></div>
            <div className="canvasFrame"><canvas id="driveCanvas" style={{ height: 86 }} /></div>
          </div>
          <div className="panelTitle" style={{ margin: '8px 0 0' }}>
            <span>order parameter R · drive rows now</span>
            <em id="rScale">—</em>
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">
            <span>readout</span>
            <em id="verdictTag">—</em>
          </div>
          <div id="readoutBars" />
          <div className="metrics" style={{ marginTop: 12 }}>
            <div className="metric"><span>truth</span><b id="mTruth">—</b></div>
            <div className="metric"><span>predicted</span><b id="mPred">—</b></div>
            <div className="metric"><span>mean R</span><b id="mR">—</b></div>
            <div className="metric"><span>sim time</span><b id="mMs">—</b></div>
          </div>
        </div>

        <div className="panel">
          <div className="panelTitle">
            <span>all four channels, flattened</span>
            <em>hue = phase</em>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((ch) => (
              <div className="canvasFrame" key={ch}>
                <canvas className="fieldGrid" data-ch={ch} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
