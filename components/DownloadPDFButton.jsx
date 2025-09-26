import { jsPDF } from "jspdf";

export default function DownloadPDFButton({ userName, skills, groups }) {
  function handleDownload() {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text(`Skills for ${userName || "User"}` , 15, y);
    y += 10;
    doc.setFontSize(12);
    skills.forEach(skill => {
      const group = groups.find(g => g.items.includes(skill.name));
      const groupTitle = group ? group.title : "";
      const desc = group?.descriptions?.[skill.name] || "";
      doc.text(`${skill.name} (${groupTitle})`, 15, y);
      y += 7;
      doc.text(`Level: ${skill.level3 ? 3 : skill.level2 ? 2 : skill.level1 ? 1 : 0}`, 20, y);
      y += 7;
      if (desc) {
        doc.setFontSize(10);
        doc.text(desc, 25, y);
        doc.setFontSize(12);
        y += 10;
      }
      y += 2;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(`skills_${userName || "user"}.pdf`);
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
      Download as PDF
    </button>
  );
}
