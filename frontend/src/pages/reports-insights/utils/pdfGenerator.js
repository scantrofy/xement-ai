import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = async ({ period, metrics, insights, historyData, latestData }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('XementAI', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Cement Manufacturing Report', 20, 30);

  // Report Info
  yPosition = 50;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Period: ${period === 'daily' ? 'Daily (24 Hours)' : 'Weekly (7 Days)'}`, 20, yPosition);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 80, yPosition);
  
  // Title
  yPosition += 15;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Production Performance Report', 20, yPosition);

  // Executive Summary Section
  yPosition += 15;
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(insights?.summary || 'No summary available', pageWidth - 40);
  doc.text(summaryLines, 20, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  // Key Metrics Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Key Performance Metrics', 20, yPosition);
  yPosition += 10;

  // Metrics Table
  const metricsData = [
    ['Average Energy Use', `${metrics.avgEnergyUse} kWh/ton`],
    ['Energy Savings', `${metrics.energySavings}%`],
    ['Total Optimizations Applied', `${metrics.totalOptimizations} actions`],
    ['CO₂ Reduction', `${metrics.co2Reduction}%`],
    ['Efficiency Improvement', `${metrics.efficiencyImprovement}%`],
    ['Quality Score', `${metrics.qualityScore}%`],
  ];

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Energy Trend Analysis
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Energy Trend Analysis', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const trendText = insights?.energyTrend === 'decreasing' 
    ? 'Energy consumption is DECREASING - Excellent progress! Continue current optimization strategies.'
    : insights?.energyTrend === 'increasing'
    ? 'Energy consumption is INCREASING - Action needed. Review recent parameter changes.'
    : 'Energy consumption is STABLE - Maintaining consistent performance.';
  
  const trendLines = doc.splitTextToSize(trendText, pageWidth - 40);
  doc.text(trendLines, 20, yPosition);
  yPosition += trendLines.length * 5 + 5;

  if (insights?.peakHours && insights.peakHours.length > 0) {
    doc.text(`Peak Energy Hours: ${insights.peakHours.map(h => `${h}:00`).join(', ')}`, 20, yPosition);
    yPosition += 10;
  }

  // AI Recommendations Section
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('AI-Powered Recommendations', 20, yPosition);
  yPosition += 10;

  if (insights?.recommendations && insights.recommendations.length > 0) {
    insights.recommendations.forEach((rec, index) => {
      checkPageBreak(30);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${rec.title}`, 25, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(rec.description, pageWidth - 50);
      doc.text(descLines, 30, yPosition);
      yPosition += descLines.length * 4 + 3;

      doc.setTextColor(59, 130, 246);
      doc.text(`Priority: ${rec.priority.toUpperCase()} | Impact: ${rec.impact}`, 30, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    });
  }

  // Energy Statistics Table
  if (historyData && historyData.length > 0) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Detailed Energy Statistics', 20, yPosition);
    yPosition += 10;

    const energyStats = [
      ['Average Energy Use', `${metrics.avgEnergyUse} kWh/ton`],
      ['Peak Energy Use', `${Math.max(...historyData.map(d => d.energy_use || 0)).toFixed(2)} kWh/ton`],
      ['Lowest Energy Use', `${Math.min(...historyData.map(d => d.energy_use || 0)).toFixed(2)} kWh/ton`],
      ['Average Emissions', `${(historyData.reduce((sum, d) => sum + (d.emissions || 0), 0) / historyData.length).toFixed(2)} kg/ton`],
      ['Average Efficiency', `${(historyData.reduce((sum, d) => sum + (d.grinding_efficiency || 0), 0) / historyData.length).toFixed(2)}%`],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Parameter', 'Value']],
      body: energyStats,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'XementAI - Smart Cement Manufacturing Platform',
      20,
      pageHeight - 10
    );
  }

  // Save the PDF
  const fileName = `XementAI_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
