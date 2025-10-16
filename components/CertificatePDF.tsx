"use client";
import { jsPDF } from "jspdf";

interface CertificateData {
  grade: string;
  total: number;
  people: number;
  planet: number;
  materials: number;
  circularity: number;
  userName: string;
  date: string;
}

export async function downloadCertificate(data: CertificateData) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración de colores
  const primaryGreen = [82, 153, 123]; // #52997B
  
  // Fondo
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 297, 210, 'F');
  
  // Header con logo
  pdf.setFontSize(24);
  pdf.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.text('Green Fashion Score', 148.5, 30, { align: 'center' });
  
  // Título del certificado
  pdf.setFontSize(32);
  pdf.setTextColor(0, 0, 0);
  pdf.text('CERTIFICADO DE SOSTENIBILIDAD', 148.5, 50, { align: 'center' });
  
  // Línea decorativa
  pdf.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  pdf.setLineWidth(1);
  pdf.line(50, 55, 247, 55);
  
  // Usuario
  pdf.setFontSize(16);
  pdf.text(`Otorgado a: ${data.userName}`, 148.5, 70, { align: 'center' });
  
  // Cargar imagen del semáforo
  const semaphoreImages = {
    A: '/branding/SEMÁFORO A.png',
    B: '/branding/SEMÁFORO B.png',
    C: '/branding/SEMÁFORO C.png',
    D: '/branding/SEMÁFORO D.png',
    E: '/branding/SEMÁFORO E.png'
  };
  
  const semaphoreUrl = semaphoreImages[data.grade as keyof typeof semaphoreImages];
  
  try {
    // Convertir imagen a base64 para incrustar en PDF
    const response = await fetch(semaphoreUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    
    reader.onloadend = function() {
      const base64data = reader.result as string;
      
      // Añadir imagen del semáforo centrada
      pdf.addImage(base64data, 'PNG', 98.5, 75, 100, 100);
      
      // Calificación
      pdf.setFontSize(48);
      pdf.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      pdf.text(`CALIFICACIÓN: ${data.grade}`, 148.5, 95, { align: 'center' });
      
      // Puntuación total
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Puntuación Total: ${data.total}/100`, 148.5, 110, { align: 'center' });
      
      // Desglose por dimensiones
      pdf.setFontSize(14);
      const dimensionsY = 130;
      const dimensionsX = 70;
      const spacing = 35;
      
      pdf.text(`PEOPLE: ${data.people}/20`, dimensionsX, dimensionsY);
      pdf.text(`PLANET: ${data.planet}/20`, dimensionsX + spacing, dimensionsY);
      pdf.text(`MATERIALS: ${data.materials}/40`, dimensionsX + spacing * 2, dimensionsY);
      pdf.text(`CIRCULARITY: ${data.circularity}/20`, dimensionsX + spacing * 3, dimensionsY);
      
      // Pie con fecha y powered by
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Fecha de emisión: ${data.date}`, 148.5, 180, { align: 'center' });
      pdf.text('Powered by ECODICTA', 148.5, 190, { align: 'center' });
      
      // Guardar PDF
      pdf.save(`GreenFashionScore_Certificado_${data.grade}_${Date.now()}.pdf`);
    };
    
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error loading semaphore image:', error);
    // Fallback sin imagen
    pdf.setFontSize(48);
    pdf.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    pdf.text(`CALIFICACIÓN: ${data.grade}`, 148.5, 95, { align: 'center' });
    
    // Puntuación total
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Puntuación Total: ${data.total}/100`, 148.5, 110, { align: 'center' });
    
    // Desglose por dimensiones
    pdf.setFontSize(14);
    const dimensionsY = 130;
    const dimensionsX = 70;
    const spacing = 35;
    
    pdf.text(`PEOPLE: ${data.people}/20`, dimensionsX, dimensionsY);
    pdf.text(`PLANET: ${data.planet}/20`, dimensionsX + spacing, dimensionsY);
    pdf.text(`MATERIALS: ${data.materials}/40`, dimensionsX + spacing * 2, dimensionsY);
    pdf.text(`CIRCULARITY: ${data.circularity}/20`, dimensionsX + spacing * 3, dimensionsY);
    
    // Pie con fecha y powered by
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Fecha de emisión: ${data.date}`, 148.5, 180, { align: 'center' });
    pdf.text('Powered by ECODICTA', 148.5, 190, { align: 'center' });
    
    // Guardar PDF
    pdf.save(`GreenFashionScore_Certificado_${data.grade}_${Date.now()}.pdf`);
  }
}

export function CertificateButton({ data }: { data: CertificateData }) {
  return (
    <button
      onClick={() => downloadCertificate(data)}
      className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
    >
      📄 Descargar Certificado PDF
    </button>
  );
}
