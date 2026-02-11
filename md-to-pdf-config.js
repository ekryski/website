module.exports = {
  dest: 'public/Eric-Kryski-CV.pdf',
  pdf_options: {
    format: 'A4',
    margin: '20mm',
    printBackground: true,
  },
  // Required for CI (GitHub Actions) where Chrome sandbox isn't available
  launch_options: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
}
