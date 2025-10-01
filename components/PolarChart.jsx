"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Radar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import groups from "../lib/groups";
import ChartDataLabels from "chartjs-plugin-datalabels";
import DownloadScreenshotButton from "./DownloadScreenshotButton";
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

export default function PolarChart({ skills = [], userName = "" }) {
  useEffect(() => {
    console.log("skills", skills);
  }, [skills]);
  // Helper to lighten a hex color by a percent (0-100)
  function lightenColor(hex, percent) {
    // Remove # if present
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.round(r + (255 - r) * (percent / 100));
    g = Math.round(g + (255 - g) * (percent / 100));
    b = Math.round(b + (255 - b) * (percent / 100));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  // Plugin to draw radial labels fixed at chart edge
  const outerLabelPlugin = {
    id: "outerLabelPlugin",
    afterDraw(chart) {
      if (chart.config.type !== "polarArea") return;
      const { ctx, chartArea } = chart;
      const labels = chart.data.labels;
      const meta = chart.getDatasetMeta(0);
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      const outerRadius =
        meta.data[0]?.outerRadius ||
        Math.min(chartArea.width, chartArea.height) / 2;
      const margin = 12;

      ctx.save();
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Place labels at the center angle of each segment
      meta.data.forEach((arc, i) => {
        if (!arc) return;
        let angle = (arc.startAngle + arc.endAngle) / 2;
        // Add small offset to avoid clipping at top/bottom
        if (angle % Math.PI === 0) {
          angle += 0.54;
        }
        const x = centerX + (outerRadius + margin) * Math.cos(angle);
        const y = centerY + (outerRadius + margin) * Math.sin(angle);
        ctx.fillText(labels[i], x, y);
      });

      ctx.restore();
    },
  };

  // Chart.js plugin for dotted border lines between segments
  const dottedBorderPlugin = {
    id: "dottedBorderPlugin",
    afterDraw: (chart) => {
      if (chart.config.type !== "polarArea") return;
      const ctx = chart.ctx;
      const { chartArea, data } = chart;
      const meta = chart.getDatasetMeta(0);
      const centerX = chartArea.left + chartArea.width / 2;
      const centerY = chartArea.top + chartArea.height / 2;
      const radius = Math.min(chartArea.width, chartArea.height) / 2;
      ctx.save();
      ctx.setLineDash([2, 6]); // Dotted line: 4px dash, 6px gap
      ctx.strokeStyle = "#c4c4c4ff";
      ctx.lineWidth = 1.2;
      meta.data.forEach((arc, i) => {
        const startAngle = arc.startAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle, false);
        ctx.lineTo(
          centerX + radius * Math.cos(startAngle),
          centerY + radius * Math.sin(startAngle)
        );
        ctx.stroke();
      });
      ctx.restore();
    },
  };
  const [chartType, setChartType] = useState("polarArea"); // "radar", "polar", or "polarArea"
  const containerRef = useRef(null);
  const orderedLabels = useMemo(() => groups.flatMap((g) => g.items), []);
  const findSkill = (name) =>
    skills.find((s) => s.name && s.name.toLowerCase() === name.toLowerCase()) ||
    {};

  // Chart.js Radar chart data
  const radarData = {
    labels: orderedLabels,
    datasets: [
      {
        label: "Level 1",
        data: orderedLabels.map((name) => findSkill(name).level1 ?? 0),
        backgroundColor: "rgba(172, 172, 172, 0.2)",
        borderColor: "#acacac",
        pointBackgroundColor: "#acacac",
      },
      {
        label: "Level 2",
        data: orderedLabels.map((name) => findSkill(name).level2 ?? 0),
        backgroundColor: "rgba(244, 132, 88, 0.2)",
        borderColor: "#f48458",
        pointBackgroundColor: "#65f458ff",
      },
      {
        label: "Level 3",
        data: orderedLabels.map((name) => findSkill(name).level3 ?? 0),
        backgroundColor: "rgba(234, 96, 113, 0.2)",
        borderColor: "#ea6071",
        pointBackgroundColor: "#ea6071",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 3,
        ticks: { stepSize: 1, color: "black" },
        pointLabels: { color: "black", font: { size: 14 } },
        grid: { color: "#acacac" },
      },
    },
    plugins: {
      legend: { position: "top" },
      tooltip: {},
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // --- Polar Area Chart: Each skill as a segment, value is its level, color by level ---
  const polarAreaLabels = orderedLabels;
  // Map skill name to group color
  const groupColors = {
    HCD: "#4269D0",
    "Project Management": "#EFB118",
    "Engagement & Communication / Business Development": "#FF725C",
    "Research & Development": "#3CA951",
  };
  // Helper to get group for a skill name
  function getGroupColor(skillName) {
    for (const group of groups) {
      if (group.items.includes(skillName)) {
        return groupColors[group.title] || "#ccc";
      }
    }
    return "#ccc";
  }
  const polarAreaValues = orderedLabels.map((name) => {
    const s = findSkill(name);
    if (s.level3 === 3) return 3;
    if (s.level2 === 2) return 2;
    if (s.level1 === 1) return 1;
    return 0;
  });
  // Color gradience by level: level3 = group color, level2 = 30% lighter, level1 = 51% lighter
  const polarAreaColors = orderedLabels.map((name, idx) => {
    const baseColor = getGroupColor(name);
    const value = polarAreaValues[idx];
    if (value === 3) return baseColor;
    if (value === 2) return lightenColor(baseColor, 30);
    if (value === 1) return lightenColor(baseColor, 51);
    return "#eee";
  });
  const polarAreaData = {
    labels: polarAreaLabels,
    datasets: [
      {
        data: polarAreaValues,
        backgroundColor: polarAreaColors,
        borderColor: "#f3f2f2ff", // strong border color
        borderWidth: 0.1,
        borderAlign: "inner", // Chart.js v3+ only
        hoverOffset: 8,
      },
    ],
  };
  const polarAreaOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxWidth: 44,
          padding: 50, // Adds space above the legend (effectively margin-top)
          generateLabels: function (chart) {
            const groupColors = {
              HCD: "#4269D0",
              "Project Management": "#EFB118",
              "Engagement & Communication / Business Development": "#FF725C",
              "Research & Development": "#3CA951",
            };
            const groupIndices = {};
            Object.keys(groupColors).forEach((group) => {
              groupIndices[group] = [];
            });
            chart.data.labels.forEach((label, idx) => {
              for (const group of Object.keys(groupColors)) {
                if (
                  groups.find((g) => g.title === group)?.items.includes(label)
                ) {
                  groupIndices[group].push(idx);
                }
              }
            });
            return Object.entries(groupColors).map(([title, color], i) => ({
              text: title,
              fillStyle: color,
              strokeStyle: "#333",
              lineWidth: 1,
              marginTop: 48,
              hidden: false,
              indices: groupIndices[title],
              datasetIndex: 0,
              groupIndex: i,
            }));
          },
        },
        onClick: function (e, legendItem, legend) {
          const chart = legend.chart;
          const indices = legendItem.indices;
          if (!indices || !indices.length) return;
          const meta = chart.getDatasetMeta(0);
          const anyVisible = indices.some((idx) => !meta.data[idx].hidden);
          indices.forEach((idx) => {
            meta.data[idx].hidden = anyVisible ? true : false;
          });
          chart.update();
        },
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  scales: {
    r: {
      ticks: {
        display: false
      }
    }
  },
  scale: {
    ticks: {
      display: false
    }
  },
    responsive: true,
    maintainAspectRatio: false,
    onClick: (evt, elements) => {
      if (elements && elements.length > 0) {
        const idx = elements[0].index;
        const skillName = polarAreaLabels[idx];
        const value = polarAreaValues[idx];
        if (value < 3) {
          alert(`Set goal for: ${skillName} (Level ${value + 1})`);
        }
      }
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
     {/* <h2>Skill map for {userName.email ? (userName.email.split("@")[0].charAt(0).toUpperCase() + userName.email.split("@")[0].slice(1)) : ""}</h2> */}
     <h2>Skill map for Neha</h2>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          {chartType === "polarArea" && (
            <div style={{ marginTop: 48 }}>
              <div style={{ minHeight: 850 }}>
                <PolarArea
                  data={polarAreaData}
                  options={polarAreaOptions}
                  plugins={[dottedBorderPlugin, outerLabelPlugin]}
                />
              </div>
              {/* Legend for group color codes */}
            </div>
          )}
        </div>
        <div style={{ alignSelf: "flex-end", marginRight: 24 }}>
          <DownloadScreenshotButton targetId="skills-content" />
        </div>
      </div>
    </div>
  );
}
