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
  // Fixed labels outside arcs
  const outerLabelPlugin = {
    id: "outerLabelPlugin",
    afterDraw(chart) {
      if (chart.config.type !== "polarArea") return;
      const { ctx, chartArea } = chart;
      const labels = chart.data.labels;
      const meta = chart.getDatasetMeta(0);
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.font = "600 12.5px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textBaseline = "middle";

      // Use a fixed radius for all labels, based on the largest available outerRadius
      let maxOuterRadius = 0;
      meta.data.forEach((arc) => {
        if (
          arc &&
          typeof arc.outerRadius === "number" &&
          arc.outerRadius > maxOuterRadius
        ) {
          maxOuterRadius = arc.outerRadius;
        }
      });
      if (!maxOuterRadius) {
        maxOuterRadius = Math.min(chartArea.width, chartArea.height) / 2;
      }

      meta.data.forEach((arc, i) => {
        if (!arc) return;
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const x = centerX + (maxOuterRadius + 1) * Math.cos(angle);
        const y = centerY + (maxOuterRadius + 25) * Math.sin(angle);
        ctx.textAlign = x < centerX ? "right" : "left";
        const label = labels[i];
        if (label.includes("&")) {
          const [first, second] = label.split("&");
          ctx.fillText(first.trim() + " &", x, y - 8);
          ctx.fillText(second.trim(), x, y + 8);
        } else {
          ctx.fillText(label, x, y);
        }
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
  // Always recalculate chart data and colors when skills change
  const orderedLabels = groups.flatMap((g) => g.items);
  const findSkill = (name) =>
    skills.find((s) => s.name && s.name.toLowerCase() === name.toLowerCase()) ||
    {};

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
    layout: {
      padding: 90, // gives extra breathing space for outer labels
    },
    plugins: {
      legend: {
        maxHeight: 200,
        display: false,
        position: "bottom",
        align: "start", // align to top if on right
        labels: {
          boxWidth: 20,
          padding: 20, // spacing between each legend row
          usePointStyle: true,

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
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          display: false,
          color: "#726b6bff",
          font: { size: 8 },
          callback: function (val) {
            return val > 0 ? val : "";
          },
        },
        grid: {
          color: "#d6d0d0ff",
        },
      },
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
      <h2 style={{ fontSize: "29px", fontWeight: 700 }}>Skill map for Neha</h2>
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
              <div>
                <PolarArea
                  data={polarAreaData}
                  options={polarAreaOptions}
                  plugins={[dottedBorderPlugin, outerLabelPlugin]}
                  height={800}
                  width={1000}
                />
              </div>
              <div style={{ marginTop: "30px" }}>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {Object.entries({
                    HCD: "#4269D0",
                    "Project Management": "#EFB118",
                    "Engagement & Communication / Business Development":
                      "#FF725C",
                    "Research & Development": "#3CA951",
                  }).map(([title, color]) => (
                    <li
                      key={title}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          backgroundColor: color,
                          marginRight: "8px",
                        }}
                      ></span>
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
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
