module.exports = {
  dest: 'public/Eric-Kryski-CV.pdf',
  // Replaces md-to-pdf's default GitHub markdown theme outright. See the
  // notes in cv.css for why the design is as restrained as it is.
  stylesheet: ['public/cv.css'],
  pdf_options: {
    format: 'A4',
    margin: { top: '13mm', bottom: '13mm', left: '16mm', right: '16mm' },
    printBackground: true,
  },
  // Required for CI (GitHub Actions) where Chrome sandbox isn't available
  launch_options: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
}
