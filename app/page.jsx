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
  const email = "libin@quicksand.co.in";
  const [skills, setSkills] = useState([]);

  async function loadSkills() {
    const res = await fetch(`/api/skills?email=${encodeURIComponent(email)}`);
    if (res.ok) setSkills(await res.json());
  }

  useEffect(() => {
    loadSkills();
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <div id="skills-content" style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <SkillEditor
            skills={skills}
            onChange={setSkills}
            reload={loadSkills}
            email={email}
          />
        </div>
        <div style={{ flex: 1 }}>
          <PolarChart skills={skills} email={email}/>
        </div>
      </div>
    </main>
  );
}
