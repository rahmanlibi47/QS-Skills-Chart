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
      title="Download skills as PDF"
      style={{
        margin: "8px 0 0 0",
        padding: "8px 8px",
        borderRadius: 6,
        background: "#4269D0",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path fill="#fff" d="M12 16a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v10a1 1 0 0 1-1 1zm-4.707-3.293a1 1 0 0 1 1.414 0L12 15.586l3.293-2.879a1 1 0 1 1 1.414 1.414l-4 3.5a1 1 0 0 1-1.414 0l-4-3.5a1 1 0 0 1 0-1.414z"/>
        <rect x="4" y="19" width="16" height="2" rx="1" fill="#fff" />
      </svg>
    </button>
  );
}
