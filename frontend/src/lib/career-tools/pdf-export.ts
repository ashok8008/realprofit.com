// PDF Export utilities for Career Tools
import jsPDF from 'jspdf';

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
    id?: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id?: string;
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
  let pdf: jsPDF;
  switch (template) {
    case 'executive':
      pdf = generateExecutiveTemplate(data);
      break;
    case 'modern':
      pdf = generateModernTemplate(data);
      break;
    case 'minimal':
      pdf = generateMinimalTemplate(data);
      break;
    case 'professional':
      pdf = generateProfessionalTemplate(data);
      break;
    default:
      pdf = generateCleanTemplate(data);
  }
  // Add subtle footer to all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(6);
    pdf.setTextColor(180, 180, 180);
    pdf.text("Built with RealProfits.com", 15, 290);
    if (pageCount > 1) {
      const pageText = `${i} / ${pageCount}`;
      pdf.text(pageText, 195 - pdf.getTextWidth(pageText), 290);
    }
  }
  return pdf;
}

// Clean Template (default ATS-friendly)
function generateCleanTemplate(data: ResumeData): jsPDF {
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

// Executive Template (premium - bold header with accent)
function generateExecutiveTemplate(data: ResumeData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 15;
  
  // Header background
  pdf.setFillColor(20, 60, 80);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Name
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255);
  pdf.text(data.personalDetails.fullName || 'Your Name', pageWidth / 2, y + 12, { align: 'center' });
  
  // Contact info
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200);
  const contactParts = [data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean);
  pdf.text(contactParts.join('  |  '), pageWidth / 2, y + 22, { align: 'center' });
  
  if (data.personalDetails.linkedin || data.personalDetails.portfolio) {
    const links = [data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean);
    pdf.text(links.join('  |  '), pageWidth / 2, y + 28, { align: 'center' });
  }
  
  y = 55;
  
  // Summary
  if (data.summary) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 60, 80);
    pdf.text('EXECUTIVE SUMMARY', 15, y);
    y += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60);
    const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 30);
    pdf.text(summaryLines, 15, y);
    y += summaryLines.length * 4.5 + 8;
  }
  
  // Experience
  if (data.experience.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 60, 80);
    pdf.text('PROFESSIONAL EXPERIENCE', 15, y);
    y += 7;
    
    data.experience.forEach((exp) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(exp.title, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, pageWidth - 15, y, { align: 'right' });
      y += 5;
      
      pdf.setFontSize(10);
      pdf.setTextColor(20, 60, 80);
      pdf.text(`${exp.company}${exp.location ? ', ' + exp.location : ''}`, 15, y);
      y += 5;
      
      if (exp.description) {
        pdf.setTextColor(60);
        const descLines = pdf.splitTextToSize(exp.description, pageWidth - 35);
        pdf.text(descLines, 18, y);
        y += descLines.length * 4 + 5;
      }
    });
  }
  
  // Education
  if (data.education.length > 0) {
    if (y > 245) { pdf.addPage(); y = 20; }
    y += 3;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 60, 80);
    pdf.text('EDUCATION', 15, y);
    y += 7;
    
    data.education.forEach((edu) => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - 15, y, { align: 'right' });
      y += 5;
      pdf.setTextColor(60);
      pdf.text(edu.school, 15, y);
      y += 7;
    });
  }
  
  // Skills
  if (data.skills.length > 0) {
    if (y > 255) { pdf.addPage(); y = 20; }
    y += 3;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 60, 80);
    pdf.text('CORE COMPETENCIES', 15, y);
    y += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60);
    const skillsText = data.skills.join('  •  ');
    const skillLines = pdf.splitTextToSize(skillsText, pageWidth - 30);
    pdf.text(skillLines, 15, y);
  }
  
  return pdf;
}

// Modern Template (two-column layout)
function generateModernTemplate(data: ResumeData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const sidebarWidth = 65;
  
  // Sidebar
  pdf.setFillColor(45, 55, 72);
  pdf.rect(0, 0, sidebarWidth, 297, 'F');
  
  let sideY = 25;
  
  // Name in sidebar
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255);
  const nameLines = pdf.splitTextToSize(data.personalDetails.fullName || 'Your Name', sidebarWidth - 16);
  pdf.text(nameLines, 8, sideY);
  sideY += nameLines.length * 6 + 10;
  
  // Contact in sidebar
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200);
  
  if (data.personalDetails.email) {
    pdf.text(data.personalDetails.email, 8, sideY);
    sideY += 5;
  }
  if (data.personalDetails.phone) {
    pdf.text(data.personalDetails.phone, 8, sideY);
    sideY += 5;
  }
  if (data.personalDetails.location) {
    pdf.text(data.personalDetails.location, 8, sideY);
    sideY += 5;
  }
  if (data.personalDetails.linkedin) {
    pdf.text(data.personalDetails.linkedin, 8, sideY);
    sideY += 5;
  }
  
  sideY += 10;
  
  // Skills in sidebar
  if (data.skills.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 200, 200);
    pdf.text('SKILLS', 8, sideY);
    sideY += 6;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200);
    data.skills.forEach(skill => {
      if (sideY < 280) {
        const skillLines = pdf.splitTextToSize('• ' + skill, sidebarWidth - 16);
        pdf.text(skillLines, 8, sideY);
        sideY += skillLines.length * 4 + 1;
      }
    });
  }
  
  // Main content
  let mainY = 20;
  const mainX = sidebarWidth + 10;
  const mainWidth = pageWidth - sidebarWidth - 20;
  
  // Summary
  if (data.summary) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.text('PROFILE', mainX, mainY);
    mainY += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80);
    const summaryLines = pdf.splitTextToSize(data.summary, mainWidth);
    pdf.text(summaryLines, mainX, mainY);
    mainY += summaryLines.length * 4.5 + 8;
  }
  
  // Experience
  if (data.experience.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.text('EXPERIENCE', mainX, mainY);
    mainY += 7;
    
    data.experience.forEach((exp) => {
      if (mainY > 265) { pdf.addPage(); mainY = 20; }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(exp.title, mainX, mainY);
      mainY += 4;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 200, 200);
      pdf.text(`${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, mainX, mainY);
      mainY += 5;
      
      if (exp.description) {
        pdf.setTextColor(80);
        const descLines = pdf.splitTextToSize(exp.description, mainWidth - 5);
        pdf.text(descLines, mainX + 3, mainY);
        mainY += descLines.length * 4 + 5;
      }
    });
  }
  
  // Education
  if (data.education.length > 0) {
    if (mainY > 250) { pdf.addPage(); mainY = 20; }
    mainY += 3;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(45, 55, 72);
    pdf.text('EDUCATION', mainX, mainY);
    mainY += 7;
    
    data.education.forEach((edu) => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, mainX, mainY);
      mainY += 4;
      pdf.setFontSize(9);
      pdf.setTextColor(80);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${edu.school} | ${edu.startDate} - ${edu.endDate}`, mainX, mainY);
      mainY += 7;
    });
  }
  
  return pdf;
}

// Minimal Template (maximum whitespace)
function generateMinimalTemplate(data: ResumeData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 30;
  
  // Name
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30);
  pdf.text(data.personalDetails.fullName || 'Your Name', 20, y);
  y += 12;
  
  // Contact
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  const contact = [data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean).join('   ');
  pdf.text(contact, 20, y);
  y += 20;
  
  // Summary
  if (data.summary) {
    pdf.setFontSize(10);
    pdf.setTextColor(80);
    const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 40);
    pdf.text(summaryLines, 20, y);
    y += summaryLines.length * 4.5 + 15;
  }
  
  // Experience
  if (data.experience.length > 0) {
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text('EXPERIENCE', 20, y);
    y += 8;
    
    data.experience.forEach((exp) => {
      if (y > 265) { pdf.addPage(); y = 25; }
      
      pdf.setFontSize(11);
      pdf.setTextColor(30);
      pdf.setFont('helvetica', 'normal');
      pdf.text(exp.title, 20, y);
      y += 5;
      
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`${exp.company}  ·  ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`, 20, y);
      y += 6;
      
      if (exp.description) {
        pdf.setTextColor(80);
        const descLines = pdf.splitTextToSize(exp.description, pageWidth - 45);
        pdf.text(descLines, 25, y);
        y += descLines.length * 4 + 8;
      }
    });
    y += 5;
  }
  
  // Education
  if (data.education.length > 0) {
    if (y > 250) { pdf.addPage(); y = 25; }
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text('EDUCATION', 20, y);
    y += 8;
    
    data.education.forEach((edu) => {
      pdf.setFontSize(10);
      pdf.setTextColor(30);
      pdf.text(`${edu.degree}${edu.field ? ', ' + edu.field : ''}`, 20, y);
      y += 4;
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`${edu.school}  ·  ${edu.startDate} – ${edu.endDate}`, 20, y);
      y += 8;
    });
    y += 5;
  }
  
  // Skills
  if (data.skills.length > 0) {
    if (y > 260) { pdf.addPage(); y = 25; }
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text('SKILLS', 20, y);
    y += 6;
    pdf.setFontSize(9);
    pdf.setTextColor(80);
    pdf.text(data.skills.join('   ·   '), 20, y);
  }
  
  return pdf;
}

// Professional Template (traditional business format)
function generateProfessionalTemplate(data: ResumeData): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;
  
  // Header line
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  pdf.line(15, y - 5, pageWidth - 15, y - 5);
  
  // Name
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0);
  pdf.text(data.personalDetails.fullName || 'Your Name', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  // Contact
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(50);
  const contactLine1 = [data.personalDetails.email, data.personalDetails.phone].filter(Boolean).join(' | ');
  const contactLine2 = [data.personalDetails.location, data.personalDetails.linkedin].filter(Boolean).join(' | ');
  pdf.text(contactLine1, pageWidth / 2, y, { align: 'center' });
  if (contactLine2) {
    y += 4;
    pdf.text(contactLine2, pageWidth / 2, y, { align: 'center' });
  }
  y += 3;
  
  pdf.line(15, y, pageWidth - 15, y);
  y += 10;
  
  // Summary
  if (data.summary) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('PROFESSIONAL SUMMARY', 15, y);
    y += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 30);
    pdf.text(summaryLines, 15, y);
    y += summaryLines.length * 4.5 + 8;
  }
  
  // Experience
  if (data.experience.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('PROFESSIONAL EXPERIENCE', 15, y);
    y += 7;
    
    data.experience.forEach((exp) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(exp.title, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80);
      pdf.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, pageWidth - 15, y, { align: 'right' });
      y += 4;
      
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(50);
      pdf.text(`${exp.company}${exp.location ? ', ' + exp.location : ''}`, 15, y);
      y += 5;
      
      if (exp.description) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50);
        const descLines = pdf.splitTextToSize(exp.description, pageWidth - 35);
        pdf.text(descLines, 20, y);
        y += descLines.length * 4 + 5;
      }
    });
  }
  
  // Education
  if (data.education.length > 0) {
    if (y > 245) { pdf.addPage(); y = 20; }
    y += 3;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('EDUCATION', 15, y);
    y += 7;
    
    data.education.forEach((edu) => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0);
      pdf.text(`${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, 15, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80);
      pdf.text(`${edu.startDate} - ${edu.endDate}`, pageWidth - 15, y, { align: 'right' });
      y += 4;
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(50);
      pdf.text(edu.school, 15, y);
      y += 7;
    });
  }
  
  // Skills
  if (data.skills.length > 0) {
    if (y > 255) { pdf.addPage(); y = 20; }
    y += 3;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('SKILLS & COMPETENCIES', 15, y);
    y += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50);
    const skillsText = data.skills.join('  •  ');
    const skillLines = pdf.splitTextToSize(skillsText, pageWidth - 30);
    pdf.text(skillLines, 15, y);
  }
  
  return pdf;
}

// Cover Letter PDF
export function generateCoverLetterPDF(
  content: string,
  applicantName: string,
  date: string
): jsPDF {
  const { drawHeader, drawFooter, LM, PW } = require("@/lib/pdf-brand");
  const pdf = new jsPDF('p', 'mm', 'a4');

  let y = drawHeader(pdf, "Cover Letter", applicantName || "Applicant");

  // Date right-aligned
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(date, LM + PW - pdf.getTextWidth(date), y);
  y += 10;

  // Applicant name
  if (applicantName) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text(applicantName, LM, y);
    y += 8;
  }

  // Content body
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  const lines = pdf.splitTextToSize(content, PW);
  pdf.text(lines, LM, y);

  drawFooter(pdf);
  return pdf;
}
