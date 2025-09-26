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

export default function PolarChart({ skills = [] }) {
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
      ctx.strokeStyle = "#f8f3f3ff";
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

  // AnyChart polar chart logic
  useEffect(() => {
    if (chartType !== "polar") return;
    let chartInstance = null;
    async function loadAndDraw() {
      if (!window.anychart) {
        await new Promise((resolve, reject) => {
          const css = document.createElement("link");
          css.rel = "stylesheet";
          css.href =
            "https://cdn.anychart.com/releases/8.11.0/css/anychart-ui.min.css";
          document.head.appendChild(css);
          const s = document.createElement("script");
          s.src =
            "https://cdn.anychart.com/releases/8.11.0/js/anychart-bundle.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      const anychart = window.anychart;
      // Only show the highest level for each skill, and color by group
      const groupColors = {
        HCD: "#4269D0",
        "Project Management": "#EFB118",
        "Engagement & Communication / Business Development": "#FF725C",
        "Research & Development": "#3CA951",
      };
      function getGroupColor(skillName) {
        for (const group of groups) {
          if (group.items.includes(skillName)) {
            return groupColors[group.title] || "#ccc";
          }
        }
        return "#ccc";
      }
      // Build data for each skill with its value and color
      const skillData = orderedLabels.map((name) => {
        const skill = findSkill(name);
        let value = 0;
        if (skill.level3 === 3) value = 3;
        else if (skill.level2 === 2) value = 2;
        else if (skill.level1 === 1) value = 1;
        return { x: name, value, fill: { color: getGroupColor(name) } };
      });
      const chart = anychart.polar();
      const series = chart.column(skillData);
      series.zIndex(1);
      chart.xScale("ordinal");
      chart.yScale().minimum(0).maximum(3);
      chart.yScale().ticks({ interval: 1 });
      chart.yScale().stackMode("value");
      const yAxis = chart.yAxis();
      yAxis.stroke("black");
      yAxis.overlapMode("allow-overlap");
      yAxis.labels().fontColor("black").fontSize("0.9em");
      yAxis.labels().format("{%Value}");
      const xAxis = chart.xAxis();
      xAxis.stroke("black");
      xAxis.overlapMode("allow-overlap");
      xAxis.labels().fontColor("black").fontSize("1em");
      chart.yGrid().stroke("black");
      chart.xGrid().stroke("black");
      chart
        .yGrid()
        .palette([
          "#FFFFFF8C",
          "#FFFFFF73",
          "#FFFFFF59",
          "#FFFFFF40",
          "#FFFFFF26",
          "#FFFFFF0D",
        ]);
      chart.sortPointsByX(true);
      chart.innerRadius("70%");
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = "";
        } catch (e) {}
        chart.container(containerRef.current);
        chart.draw();
        chartInstance = chart;
      }
    }
    loadAndDraw().catch((err) => console.error("Error loading AnyChart:", err));
    return () => {
      try {
        if (chartInstance) chartInstance.dispose();
      } catch (e) {}
    };
    // eslint-disable-next-line
  }, [skills, chartType]);

  // Color codes for display below
  const colorCodes = [
    { label: "Level 1", color: "#acacac" },
    { label: "Level 2", color: "#f48458" },
    { label: "Level 3", color: "#ea6071" },
  ];

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
  const polarAreaColors = orderedLabels.map((name) => getGroupColor(name));
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
        labels: {
          generateLabels: function (chart) {
            // Only show group titles as legend items
            const groupColors = {
              HCD: "#4269D0",
              "Project Management": "#EFB118",
              "Engagement & Communication / Business Development": "#FF725C",
              "Research & Development": "#3CA951",
            };
            return Object.entries(groupColors).map(([title, color]) => ({
              text: title,
              fillStyle: color,
              strokeStyle: "#333",
              lineWidth: 1,
              hidden: false,
              index: 0,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const value = polarAreaValues[idx];
            // Show golden/yellow stars for the value
            if (value > 0) {
              // Use Unicode yellow star emoji
              return "".padStart(value, "⭐");
            } else {
              return "";
            }
          },
        },
      },
      datalabels: {
        color: "#111",
        font: {
          weight: "bold",
          size: 10,
        },
        formatter: (value, context) => polarAreaLabels[context.dataIndex],
        anchor: "end", // base outside of arc
        align: "end", // move further outward radially
        offset: 0, // bigger = further outside
        clip: false, // don’t cut off
      },
    },
    scale: {
      ticks: { beginAtZero: true, stepSize: 1, max: 3 },
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
    <div>
      <h2>Skills Chart</h2>
      <div style={{ marginBottom: 16 }}>
        {/* <button
          onClick={() => setChartType("radar")}
          style={{
            marginRight: 8,
            padding: "8px 16px",
            background: chartType === "radar" ? "#e0e0e0" : "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Radar Chart
        </button> */}

        {/* <button
          onClick={() => setChartType("polarArea")}
          style={{
            padding: "8px 16px",
            background: chartType === "polarArea" ? "#e0e0e0" : "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Polar Chart
        </button>
        <button
          onClick={() => setChartType("polar")}
          style={{
            marginRight: 8,
            padding: "8px 16px",
            background: chartType === "polar" ? "#e0e0e0" : "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          Radial Chart
        </button> */}
      </div>
      {chartType === "radar" && (
        <div style={{ height: 700, width: "100%" }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
      )}
      {chartType === "polar" && (
        <div ref={containerRef} style={{ height: 700, width: "100%" }} />
      )}
      {chartType === "polarArea" && (
        <div style={{ marginTop: 48 }}>
          <div style={{ height: 700, width: "100%" }}>
            <PolarArea
              data={polarAreaData}
              options={polarAreaOptions}
              plugins={[dottedBorderPlugin]}
            />
          </div>
          {/* Legend for group color codes */}
        </div>
      )}
    </div>
  );
}
