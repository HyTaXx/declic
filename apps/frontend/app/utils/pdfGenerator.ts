import { jsPDF } from 'jspdf'
import type { ModuleResult } from './results'

interface PDFGeneratorOptions {
  results: ModuleResult[]
}

/**
 * Generates and downloads a PDF report of the survey results.
 */
export function generateResultsPDF(options: PDFGeneratorOptions): void {
  const doc = new jsPDF()
  const { results } = options

  doc.setProperties({
    title: 'Résultats - Déclic',
    subject: 'Bilan de ton questionnaire Déclic',
    author: 'Déclic',
    creator: 'Déclic App',
  })

  doc.viewerPreferences({ DisplayDocTitle: true })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2

  const primaryColor = '#1D4ED8'
  const secondaryColor = '#111827'
  const textColor = '#374151'
  const accentColor = '#047857'

  doc.setFillColor(primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor('#FFFFFF')
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('Déclic', margin, 28)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Ton bilan personnalisé', pageWidth - margin, 28, {
    align: 'right',
  })

  let yPosition = 60

  doc.setTextColor(secondaryColor)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Résultats par module', margin, yPosition)

  yPosition += 10
  doc.setDrawColor('#E5E7EB')
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 20

  results.forEach((item) => {
    doc.setFillColor(primaryColor)

    doc.setTextColor(secondaryColor)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(item.moduleName, margin, yPosition)
    yPosition += 8

    doc.setTextColor(accentColor)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')

    const resultTextLines = doc.splitTextToSize(item.result.text, contentWidth)
    doc.text(resultTextLines, margin, yPosition)

    yPosition += resultTextLines.length * 7 + 4

    doc.setTextColor(textColor)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'italic')

    const description = 'Score calculé sur la base de tes réponses.'
    const splitDesc = doc.splitTextToSize(description, contentWidth)
    doc.text(splitDesc, margin, yPosition)

    yPosition += splitDesc.length * 5 + 10

    doc.setDrawColor('#F3F4F6')
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    if (yPosition > 270) {
      doc.addPage()
      yPosition = 30
    }
  })

  const footerY = 280
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  doc.setFontSize(10)
  doc.setTextColor('#9CA3AF')
  doc.text(`Document généré le ${date}`, margin, footerY)
  doc.text('Déclic - Prenez soin de vous', pageWidth - margin, footerY, {
    align: 'right',
  })

  doc.save('bilan-declic.pdf')
}
