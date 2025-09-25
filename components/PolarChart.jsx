"use client";

import { useEffect, useRef } from "react";
import groups from "../lib/groups";

export default function PolarChart({ skills = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let chartInstance = null;

    async function loadAndDraw() {
      // load AnyChart (CSS + JS) from CDN if not already present
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

      // flatten orderedLabels and map skills into the ordered arrays for AnyChart
      const orderedLabels = groups.flatMap((g) => g.items);
      const findSkill = (name) =>
        skills.find(
          (s) => s.name && s.name.toLowerCase() === name.toLowerCase()
        ) || {};

      const level1 = orderedLabels.map((name) => ({
        x: name,
        value: findSkill(name).level1 ?? 0,
      }));
      const level2 = orderedLabels.map((name) => ({
        x: name,
        value: findSkill(name).level2 ?? 0,
      }));
      const level3 = orderedLabels.map((name) => ({
        x: name,
        value: findSkill(name).level3 ?? 0,
      }));

      // create polar chart and three stacked column series
      const chart = anychart.polar();
      const seriesGray = chart.column(level1);
      seriesGray.color("#acacac");
      seriesGray.zIndex(1);

      const seriesOrange = chart.column(level2);
      seriesOrange.color("#f48458");
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
        // clear container to avoid duplicate/blank chart remnants
        try {
          containerRef.current.innerHTML = "";
        } catch (e) {
          /* ignore */
        }
        chart.container(containerRef.current);
        chart.draw();
        chartInstance = chart;
      }
    }

    loadAndDraw().catch((err) => console.error("Error loading AnyChart:", err));

    return () => {
      try {
        if (chartInstance) chartInstance.dispose();
      } catch (e) {
        /* ignore */
      }
    };
  }, [skills]);

  return  (
    <div >
      <h2>Skills Chart</h2>
      <div ref={containerRef} style={{ height: 1080, width: "100%", marginLeft:'-30%'}} />

      {/* Grouped label list (Column 1 headings -> Column 2 items) with highlighted value badges */}
    </div>
  );
}
