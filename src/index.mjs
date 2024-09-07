import * as pdfjsLib from 'pdfjs-dist/webpack.mjs'
import {createHighlighterCore} from 'shiki/core'
import getWasm from 'shiki/wasm'

import './index.css'

const highlighter = await createHighlighterCore({
  themes: [
    import('shiki/themes/github-dark.mjs')
  ],
  langs: [
    import('shiki/langs/latex.mjs'),
  ],
  loadWasm: getWasm
})

document.querySelectorAll('.language-latex').forEach(e => {
  const html = highlighter.codeToHtml(e.innerText, {
    lang: 'latex',
    theme: 'github-dark'
  })

  e.parentElement.outerHTML = html
});

(async function () {
  const cvViewer = document.getElementById('cv-viewer')
  const cvSource = cvViewer.closest('a')
  if (!cvSource || !cvSource.hasAttribute('href')) {
    return
  }

  const loader = document.getElementById('loader')

  // Setting worker path to worker bundle.

  pdfjsLib.GlobalWorkerOptions.workerSrc = '../dist/pdf.worker.bundle.js'
  // Support for HiDPI screens
  const outputScale = window.devicePixelRatio || 1

  const pdfPath = cvSource.getAttribute('href')
  // Load PDF
  const loadingTask = pdfjsLib.getDocument(pdfPath)
  const pdfDocument = await loadingTask.promise

  const numPages = pdfDocument.numPages

  for (let p = 1; p <= numPages; p++) {
    const canvas = document.createElement('canvas')
    canvas.id = `cv-p${p}`
    cvViewer.appendChild(canvas)
  }

  const renderAllPages = async function () {
    const pages = []
    for (let p = 1; p <= numPages; p++) {
      pages.push(render(p))
    }

    loader.style.display = 'block'
    await Promise.all(pages)
      .then(value => {
        loader.style.display = 'none'
      })
  }

  async function render(pageNumber) {
    const pId = `cv-p${pageNumber}`
    const pdfPage = await pdfDocument.getPage(pageNumber)
    const viewport = pdfPage.getViewport({scale: 1})
    const maxWidth = Math.floor(cvViewer.closest('.column').offsetWidth)
    const scale = (maxWidth / viewport.width) * outputScale
    const scaledViewport = pdfPage.getViewport({scale: scale})

    const newCanvas = document.createElement('canvas')
    newCanvas.id = pId
    newCanvas.style.maxWidth = `${maxWidth}px`
    newCanvas.style.width = `${maxWidth}px`
    newCanvas.width = scaledViewport.width
    newCanvas.height = scaledViewport.height

    const context = newCanvas.getContext('2d')

    pdfPage.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise.then(() => {
      document.getElementById(pId).replaceWith(newCanvas)
    })
  }

  // On resize, re-render pdf
  window.addEventListener('resize', () => {
    renderAllPages().then();
  })

  // First rendering
  await renderAllPages()
}());
