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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
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
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1.2;
      meta.data.forEach((arc, i) => {
        const startAngle = arc.startAngle;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle, false);
        ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
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
        "HCD": "#4269D0",
        "Project Management": "#EFB118",
        "Engagement & Communication / Business Development": "#FF725C",
        "Research & Development": "#3CA951"
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex;
            const skillName = polarAreaLabels[idx];
            const value = polarAreaValues[idx];
            let nextGoal =
              value < 3
                ? `Click to set goal for Level ${value + 1}`
                : "Max Level";
            return `${skillName}: Level ${value} (${nextGoal})`;
          },
        },
      },
      dottedBorderPlugin,
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
          // Only allow click for skills not at max level
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
        
        <button
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
        </button>
      </div>
      {chartType === "radar" && (
        <div style={{ height: 900, width: "100%", maxWidth: 900 }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
      )}
      {chartType === "polar" && (
        <div
          ref={containerRef}
          style={{ height: 900, width: "100%", maxWidth: 1900 }}
        />
      )}
      {chartType === "polarArea" && (
        <div style={{ marginTop: 48 }}>
          <h2>Polar Area Chart (Skills & Levels)</h2>
          <div style={{ height: 900, width: "100%", maxWidth: 700 }}>
            <PolarArea data={polarAreaData} options={polarAreaOptions} plugins={[dottedBorderPlugin]} />
          </div>
          {/* Legend */}
          {/* <div style={{ marginTop: 16 }}>
            <h4>Legend</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    background: "#acacac",
                    display: "inline-block",
                    borderRadius: "4px",
                    border: "1px solid #333",
                  }}
                />
                <span>Level 1</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    background: "#f48458",
                    display: "inline-block",
                    borderRadius: "4px",
                    border: "1px solid #333",
                  }}
                />
                <span>Level 2</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    background: "#ea6071",
                    display: "inline-block",
                    borderRadius: "4px",
                    border: "1px solid #333",
                  }}
                />
                <span>Level 3</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    background: "#fff",
                    display: "inline-block",
                    borderRadius: "4px",
                    border: "1px solid #333",
                  }}
                />
                <span>Unset</span>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
