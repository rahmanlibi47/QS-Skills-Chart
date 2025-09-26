"use client";

import { useEffect, useState } from "react";
import SkillEditor from "../components/SkillEditor";
import PolarChart from "../components/PolarChart";

export default function Page() {
  const [skills, setSkills] = useState([]);

  async function loadSkills() {
    const res = await fetch("/api/skills");
    if (res.ok) setSkills(await res.json());
  }

  useEffect(() => {
    loadSkills();
  }, []);

  return (
    <main style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <SkillEditor skills={skills} onChange={setSkills} reload={loadSkills} />
      </div>
      <div style={{ flex: 1 }}>
        <PolarChart skills={skills} />
      </div>
    </main>
  );
}
