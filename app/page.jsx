"use client";

import { useEffect, useState } from "react";
import SkillEditor from "../components/SkillEditor";
import PolarChart from "../components/PolarChart";
import Landing from "./landing";
import DownloadPDFButton from "../components/DownloadPDFButton";
import DownloadScreenshotButton from "../components/DownloadScreenshotButton";
import groups from "../lib/groups";
import { useEmail } from "../components/Providers";

export default function Page() {
  // Dummy skills data for testing
  const [skills, setSkills] = useState([
    {
      name: "Pitching",
      group: "Engagement & Communication / Business Development",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Field Research",
      group: "HCD",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Secondary Research",
      group: "HCD",
      level1: 1,
      level2: 0,
      level3: 0,
    },
    {
      name: "Analysis & Synthesis",
      group: "HCD",
      level1: 1,
      level2: 0,
      level3: 0,
    },
    {
      name: "Prototyping & Ideation",
      group: "HCD",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Workshop Facilitation",
      group: "HCD",
      level1: 1,
      level2: 2,
      level3: 0,
    },
    {
      name: "Crafting Narratives",
      group: "HCD",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Publishing",
      group: "Engagement & Communication / Business Development",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Presenting",
      group: "Engagement & Communication / Business Development",
      level1: 1,
      level2: 0,
      level3: 0,
    },
    {
      name: "Networking",
      group: "Engagement & Communication / Business Development",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Planning & Scheduling",
      group: "Project Management",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Risk Management & Problem Solving",
      group: "Project Management",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Budget & Resource Management",
      group: "Project Management",
      level1: 1,
      level2: 2,
      level3: 3,
    },
    {
      name: "Stakeholder & Team Management",
      group: "Project Management",
      level1: 1,
      level2: 0,
      level3: 0,
    },
    {
      name: "Strategic experimentation",
      group: "Research & Development",
      level1: 1,
      level2: 2,
      level3: 0,
    },
    {
      name: "Reflective learning",
      group: "Research & Development",
      level1: 1,
      level2: 2,
      level3: 3,
    },
  ]);

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <div id="skills-content" style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <SkillEditor
            skills={skills}
            onChange={setSkills}
          />
        </div>
        <div style={{ flex: 1 }}>
          <PolarChart skills={skills} />
        </div>
      </div>
    </main>
  );
}
