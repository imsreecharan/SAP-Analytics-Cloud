const template = document.createElement('template')
template.innerHTML = `
    <style>
        #root div {
            margin: 0.5rem;
        }
        #root .title {
            font-weight: bold;
        }
        #root #code {
          width: 100%;
          height: 480px;
        }
    </style>
    <div id="root" style="width: 100%; height: 100%;">
        <div class="title">Python code</div>
        <textarea id="code"></textarea>
    </div>
    <div>
        <button id="button">Apply</button>
    </div>
    `

const PY_DEFAULT = `from matplotlib import pyplot as plt
import numpy as np
import io, base64
from js import _pyodide_matplotlib_data, _pyodide_matplotlib_title

SAC_DATA = _pyodide_matplotlib_data.to_py()
SAC_TITLE = _pyodide_matplotlib_title

# Generate data points from SAC_DATA
x = []
y = []
scale = []
for row in SAC_DATA:
    x.append(row[0])
    y.append(row[1])
    scale.append(row[2])
# Map each onto a scatterplot we'll create with Matplotlib
fig, ax = plt.subplots()
ax.scatter(x=x, y=y, c=scale, s=np.abs(scale)*200)
ax.set(title=SAC_TITLE)
# plt.show()
buf = io.BytesIO()
fig.savefig(buf, format='png')
buf.seek(0)
img_str = 'data:image/png;base64,' + base64.b64encode(buf.read()).decode('UTF-8')`

class Styling extends HTMLElement {
  constructor () {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.appendChild(template.content.cloneNode(true))
    this._root = this._shadowRoot.getElementById('root')

    this._code = this._shadowRoot.getElementById('code')
    this._code.value = PY_DEFAULT

    this._button = this._shadowRoot.getElementById('button')
    this._button.addEventListener('click', () => {
      const py = this._code.value
      this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { py } } }))
    })
  }

  // ------------------
  // LifecycleCallbacks
  // ------------------
  async onCustomWidgetBeforeUpdate (changedProps) {
  }

  async onCustomWidgetAfterUpdate (changedProps) {
    if (changedProps.py) {
      this._code.value = changedProps.py
    }
  }

  async onCustomWidgetResize (width, height) {
  }

  async onCustomWidgetDestroy () {
    this.dispose()
  }

  // ------------------
  //
  // ------------------

  dispose () {
  }
}

customElements.define('com-sap-sample-pyodide-matplotlib-styling', Styling)
