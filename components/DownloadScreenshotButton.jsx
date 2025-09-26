import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function DownloadScreenshotButton({ targetId }) {
  async function handleDownload() {
    const element = document.getElementById(targetId);
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("skills_chart.pdf");
  }

  return (
    <button
      onClick={handleDownload}
      style={{
        margin: "16px 0 0 0",
        padding: "10px 18px",
        fontSize: 16,
        borderRadius: 6,
        background: "#4269D0",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        cursor: "pointer"
      }}
    >
      Download Page as PDF
    </button>
  );
}
