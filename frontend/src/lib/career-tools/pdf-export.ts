// PDF Export utilities for Career Tools
import jsPDF from 'jspdf';

interface PDFOptions {
  title: string;
  subtitle?: string;
  filename: string;
}

export function createCareerPDF(options: PDFOptions): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Header
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text('RealProfits.com', 15, 15);
  pdf.text(new Date().toLocaleDateString(), pageWidth - 15, 15, { align: 'right' });
  
  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(0);
  pdf.text(options.title, 15, 35);
  
  if (options.subtitle) {
    pdf.setFontSize(12);
    pdf.setTextColor(100);
    pdf.text(options.subtitle, 15, 45);
  }
  
  return pdf;
}

export function addSection(pdf: jsPDF, title: string, y: number): number {
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 15, y);
  pdf.setFont('helvetica', 'normal');
  return y + 8;
}

export function addText(pdf: jsPDF, text: string, y: number, options?: { indent?: number; fontSize?: number; color?: number }): number {
  const indent = options?.indent || 15;
  const fontSize = options?.fontSize || 11;
  const color = options?.color || 50;
  
  pdf.setFontSize(fontSize);
  pdf.setTextColor(color);
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxWidth = pageWidth - indent - 15;
  const lines = pdf.splitTextToSize(text, maxWidth);
  
  pdf.text(lines, indent, y);
  return y + (lines.length * (fontSize * 0.4));
}

export function addKeyValue(pdf: jsPDF, key: string, value: string, y: number): number {
  pdf.setFontSize(11);
  pdf.setTextColor(100);
  pdf.text(key + ':', 15, y);
  pdf.setTextColor(0);
  pdf.text(value, 60, y);
  return y + 6;
}

export function downloadPDF(pdf: jsPDF, filename: string): void {
  pdf.save(filename);
}

// Resume-specific PDF generation
export interface ResumeData {
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  certifications: string[];
}

export function generateResumePDF(data: ResumeData, template: string = 'clean'): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;
  
  // Name
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.personalDetails.fullName || 'Your Name', pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  // Contact info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80);
  const contactParts = [
    data.personalDetails.email,
    data.personalDetails.phone,
    data.personalDetails.location
  ].filter(Boolean);
  pdf.text(contactParts.join(' | '), pageWidth / 2, y, { align: 'center' });
  y += 5;
  
  if (data.personalDetails.linkedin || data.personalDetails.portfolio) {
    const links = [data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean);
    pdf.text(links.join(' | '), pageWidth / 2, y, { align: 'center' });
    y += 5;
  }
  
  y += 5;
  
  // Summary
  if (data.summary) {
    pdf.setDrawColor(200);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('PROFESSIONAL SUMMARY', 15, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 30);
    pdf.text(summaryLines, 15, y);
    y += summaryLines.length * 5 + 5;
  }
  
  // Experience
  if (data.experience.length > 0) {
    pdf.setDrawColor(200);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('EXPERIENCE', 15, y);
    y += 8;
    
    data.experience.forEach((exp) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(exp.title, 15, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80);
      const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      pdf.text(dateText, pageWidth - 15, y, { align: 'right' });
      y += 5;
      
      pdf.setFontSize(10);
      pdf.setTextColor(60);
      pdf.text(`${exp.company}${exp.location ? ', ' + exp.location : ''}`, 15, y);
      y += 6;
      
      if (exp.description) {
        pdf.setTextColor(50);
        const descLines = pdf.splitTextToSize(exp.description, pageWidth - 35);
        pdf.text(descLines, 20, y);
        y += descLines.length * 4.5 + 4;
      }
    });
  }
  
  // Education
  if (data.education.length > 0) {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setDrawColor(200);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('EDUCATION', 15, y);
    y += 8;
    
    data.education.forEach((edu) => {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, 15, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80);
      const dates = `${edu.startDate} - ${edu.endDate}`;
      pdf.text(dates, pageWidth - 15, y, { align: 'right' });
      y += 5;
      
      pdf.setFontSize(10);
      pdf.setTextColor(60);
      pdf.text(edu.school, 15, y);
      y += 8;
    });
  }
  
  // Skills
  if (data.skills.length > 0) {
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setDrawColor(200);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('SKILLS', 15, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const skillsText = data.skills.join(' • ');
    const skillLines = pdf.splitTextToSize(skillsText, pageWidth - 30);
    pdf.text(skillLines, 15, y);
    y += skillLines.length * 5 + 5;
  }
  
  // Certifications
  if (data.certifications.length > 0) {
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }
    
    pdf.setDrawColor(200);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('CERTIFICATIONS', 15, y);
    y += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    data.certifications.forEach((cert) => {
      pdf.text('• ' + cert, 15, y);
      y += 5;
    });
  }
  
  return pdf;
}

// Cover Letter PDF
export function generateCoverLetterPDF(
  content: string,
  applicantName: string,
  date: string
): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 30;
  
  // Date
  pdf.setFontSize(11);
  pdf.setTextColor(80);
  pdf.text(date, pageWidth - 15, y, { align: 'right' });
  y += 20;
  
  // Content
  pdf.setFontSize(11);
  pdf.setTextColor(30);
  const lines = pdf.splitTextToSize(content, pageWidth - 30);
  pdf.text(lines, 15, y);
  
  return pdf;
}
