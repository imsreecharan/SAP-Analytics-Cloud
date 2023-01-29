var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

const parseMetadata = metadata => {
  const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata
  const dimensions = []
  for (const key in dimensionsMap) {
    const dimension = dimensionsMap[key]
    dimensions.push({ key, ...dimension })
  }
  const measures = []
  for (const key in measuresMap) {
    const measure = measuresMap[key]
    measures.push({ key, ...measure })
  }
  return { dimensions, measures, dimensionsMap, measuresMap }
}

(function () {
  const template = document.createElement('template')
  template.innerHTML = `
      <style>
      </style>
      <div id="root" style="width: 100%; height: 100%; text-align: center;">
        <img id="pyplotfigure"/>
      </div>
    `
  class Main extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')
      this._pyplotfigure = this._shadowRoot.getElementById('pyplotfigure')

      this._props = {}

      this._pyodide = null
      this.bootstrap()
    }

    async onCustomWidgetAfterUpdate (changedProps) {
      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    async bootstrap () {
      // https://cdnjs.cloudflare.com/ajax/libs/pyodide/0.21.3/pyodide.js
      // https://cdn.staticfile.org/pyodide/0.21.3/pyodide.js
      await getScriptPromisify('https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js')
      const pyodide = await loadPyodide()
      await pyodide.loadPackage('matplotlib')

      this._pyodide = pyodide
      this.render()
    }

    async render () {
      this.dispose()

      if (!this._pyodide) { return }
      if (!this.py) { return }

      const dataBinding = this.dataBinding
      if (!dataBinding || dataBinding.state !== 'success') { return }

      const { data, metadata } = dataBinding
      const { dimensions, measures } = parseMetadata(metadata)

      if (dimensions.length !== 1) { return }
      if (measures.length !== 3) { return }

      const [d] = dimensions
      const [m0, m1, m2] = measures
      const million = 1000 * 1000
      // window._pyodide_matplotlib_data = [[11, 12, 15], [13, 6, 20], [10, 8, 12], [12, 15, 8]]
      window._pyodide_matplotlib_data = data.map(dp => {
        return [
          dp[m0.key].raw / million,
          dp[m1.key].raw / million,
          dp[m2.key].raw / million
        ]
      })

      window._pyodide_matplotlib_title = `${[m0.label, m1.label, m2.label].join(', ')} per ${d.description}`

      // https://pyodide.org/en/stable/usage/type-conversions.html
      this._pyodide.runPython(this.py)
      this._pyplotfigure.src = this._pyodide.globals.get('img_str')
      this._pyplotfigure.style.width = '100%'
      this._pyplotfigure.style.height = '100%'
    }

    dispose () {
      this._pyplotfigure.src = ''
      this._pyplotfigure.style.width = ''
      this._pyplotfigure.style.height = ''
    }
  }

  customElements.define('com-sap-sample-pyodide-matplotlib', Main)
})()
