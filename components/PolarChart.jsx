"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import groups from "../lib/groups";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function PolarChart({ skills = [] }) {
  const [chartType, setChartType] = useState("radar"); // "radar" or "polar"
  const containerRef = useRef(null);
  const orderedLabels = useMemo(() => groups.flatMap((g) => g.items), []);
  const findSkill = (name) =>
    skills.find((s) => s.name && s.name.toLowerCase() === name.toLowerCase()) || {};

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
          css.href = "https://cdn.anychart.com/releases/8.11.0/css/anychart-ui.min.css";
          document.head.appendChild(css);
          const s = document.createElement("script");
          s.src = "https://cdn.anychart.com/releases/8.11.0/js/anychart-bundle.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      const anychart = window.anychart;
      // Only show the highest level for each skill
      const level1 = [];
      const level2 = [];
      const level3 = [];
      orderedLabels.forEach((name) => {
        const skill = findSkill(name);
        if (skill.level3 === 3) {
          level3.push({ x: name, value: 3 });
          level2.push({ x: name, value: 0 });
          level1.push({ x: name, value: 0 });
        } else if (skill.level2 === 2) {
          level3.push({ x: name, value: 0 });
          level2.push({ x: name, value: 2 });
          level1.push({ x: name, value: 0 });
        } else if (skill.level1 === 1) {
          level3.push({ x: name, value: 0 });
          level2.push({ x: name, value: 0 });
          level1.push({ x: name, value: 1 });
        } else {
          level3.push({ x: name, value: 0 });
          level2.push({ x: name, value: 0 });
          level1.push({ x: name, value: 0 });
        }
      });
      const chart = anychart.polar();
      const seriesGray = chart.column(level1);
      seriesGray.color("#dcdd88ff");
      seriesGray.zIndex(1);
      const seriesOrange = chart.column(level2);
      seriesOrange.color("#4ff779ff");
      seriesOrange.zIndex(1);
      const seriesRed = chart.column(level3);
      seriesRed.color("#ea6071");
      seriesRed.zIndex(1);
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
      chart.yGrid().palette([
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

  return (
    <div>
      <h2>Skills Chart</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setChartType("radar")}
          style={{ marginRight: 8, padding: "8px 16px", background: chartType === "radar" ? "#e0e0e0" : "#fff", border: "1px solid #ccc", borderRadius: 4 }}
        >
          Radar Chart
        </button>
        <button
          onClick={() => setChartType("polar")}
          style={{ padding: "8px 16px", background: chartType === "polar" ? "#e0e0e0" : "#fff", border: "1px solid #ccc", borderRadius: 4 }}
        >
          Polar Chart
        </button>
      </div>
      {chartType === "radar" ? (
        <div style={{ height: 900, width: "100%", maxWidth: 900 }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
      ) : (
        <div ref={containerRef} style={{ height: 900, width: "100%", maxWidth: 1900 }} />
      )}
      <div style={{ marginTop: 32 }}>
        <h3>Color Code Values</h3>
        <div style={{ display: "flex", gap: 24 }}>
          {colorCodes.map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 24, height: 24, background: c.color, display: "inline-block", borderRadius: "50%", border: "1px solid #333" }} />
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div> 
  );
}

