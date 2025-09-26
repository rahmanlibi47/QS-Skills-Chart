"use client";

import { useState } from "react";
import groups from "../lib/groups";

export default function SkillEditor({ skills = [], onChange, reload }) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div style={{ paddingLeft: "1rem" }}>
      <h2>Review Your Skills</h2>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {groups.map((group, idx) => (
          <button
            key={group.title}
            onClick={() => setSelectedTab(idx)}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: selectedTab === idx ? "#e0e0e0" : "#fff",
              fontWeight: selectedTab === idx ? "bold" : "normal",
              cursor: "pointer"
            }}
          >
            {group.title}
          </button>
        ))}
      </div>
      {/* Skills for selected tab */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4>{groups[selectedTab].title}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groups[selectedTab].items.map((name) => {
            const s = skills.find(
              (x) => x.name && x.name.toLowerCase() === name.toLowerCase()
            );
            return (
              <SkillRow
                key={name}
                skill={s}
                name={name}
                group={groups[selectedTab].title}
                onSaved={reload}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";

function SkillRow({ skill, name, group, onSaved }) {
  // Single value for level
  const getInitialLevel = () => {
    if (skill?.level3) return 3;
    if (skill?.level2) return 2;
    if (skill?.level1) return 1;
    return 0;
  };
  const [level, setLevel] = useState(getInitialLevel());

  useEffect(() => {
    setLevel(getInitialLevel());
  }, [skill?.level1, skill?.level2, skill?.level3]);

  // Map single level to all three levels
  function getLevels(val) {
    val = Math.max(0, Math.min(3, Number(val)));
    return {
      level1: val >= 1 ? 1 : 0,
      level2: val >= 2 ? 2 : 0,
      level3: val === 3 ? 3 : 0,
    };
  }

  async function saveInstant(val) {
    setLevel(val);
    const updatedForm = getLevels(val);
    if (skill && skill._id) {
      await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: skill._id, ...updatedForm }),
      });
    } else {
      await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, group, ...updatedForm }),
      });
    }
    if (onSaved) onSaved();
  }

  // Determine color based on group title
  const groupColors = {
    "HCD": "#4269D0",
    "Project Management": "#EFB118",
    "Engagement & Communication / Business Development": "#FF725C",
    "Research & Development": "#3CA951"
  };
  const badgeColor = groupColors[group] || "#ccc";

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        alignItems: "center",
        paddingLeft: "2rem",
      }}
    >
      <div style={{ flex: "0 0 260px", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
        {skill?.name ?? name}
      </div>

      {/* Star selector for skill level */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[1, 2, 3].map((lvl) => (
          <span
            key={lvl}
            onClick={() => saveInstant(lvl)}
            style={{
              cursor: "pointer",
              fontSize: 28,
              color: level >= lvl ? "#FFD700" : "#ccc",
              transition: "color 0.2s",
              marginRight: 2,
              userSelect: "none",
              textShadow: level >= lvl ? "0 0 4px #FFD700" : "none",
            }}
            title={`Set level ${lvl}`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
