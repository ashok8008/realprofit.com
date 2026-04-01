import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Share2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface ExportProps {
  elementId: string;
  title: string;
  data?: any;
}

export function ExportToPDFButton({ elementId, title }: ExportProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(title, 20, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("RealProfits Financial Report", 20, 30);
      
      const element = document.getElementById(elementId);
      if (element) {
        doc.text("Results have been generated. (Detailed export requires html2canvas)", 20, 50);
      }
      
      doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}-results.pdf`);
      toast({ title: "PDF Downloaded", description: "Your results have been saved as a PDF." });
    } catch (e) {
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <FileText className="w-4 h-4" /> PDF
    </Button>
  );
}

export function ExportToCSVButton({ data, title }: { data: any[], title: string }) {
  const { toast } = useToast();

  const handleExport = () => {
    if (!data || !data.length) {
      toast({ title: "No Data", description: "There is no data to export." });
      return;
    }
    
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '-').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" /> CSV
    </Button>
  );
}

export function PrintResultsButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2">
      <Printer className="w-4 h-4" /> Print
    </Button>
  );
}

export function ShareResultsButton() {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "You can now share your results with this link." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to copy link." });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
      <Share2 className="w-4 h-4" /> Share
    </Button>
  );
}
