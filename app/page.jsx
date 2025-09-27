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
  const { email, setEmail } = useEmail();
  const [skills, setSkills] = useState([]);
  const [userName, setUserName] = useState("");

  async function loadSkills() {
    if (!userName) return;
    console.log("Loading skills for", userName);
    const res = await fetch(
      `/api/skills?email=${encodeURIComponent(userName.email)}`
    );
    if (res.ok) setSkills(await res.json());
  }

  useEffect(() => {
    loadSkills();
  }, [userName]);

  if (!userName) {
    return <Landing onSubmit={setUserName} />;
  }

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <div id="skills-content" style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <SkillEditor
            skills={skills}
            onChange={setSkills}
            reload={loadSkills}
            userName={userName}
          />
        </div>
        <div style={{ flex: 1 }}>
          <PolarChart skills={skills} userName={userName} />
        </div>
      </div>
    </main>
  );
}
