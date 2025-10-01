"use client";

import { useState } from "react";
import groups from "../lib/groups";
import { useEmail } from "../components/Providers";

export default function SkillEditor({ skills = [], onChange, reload }) {
  const [selectedTab, setSelectedTab] = useState(0);

  // Group colors for tabs (same as PolarChart)
  const groupColors = {
    HCD: "#4269D0",
    "Project Management": "#EFB118",
    "Engagement & Communication / Business Development": "#FF725C",
    "Research & Development": "#3CA951",
  };

  // Track which skill is open for review (by id: name__group)
  const [openReviewId, setOpenReviewId] = useState(() => {
    // Expand first skill by default
    const firstGroup = groups[0];
    const firstName = firstGroup.items[0];
    return `${firstName}__${firstGroup.title}`;
  });

  return (
    <div style={{ paddingLeft: "1rem" }}>
      <h2>Review Your Current Skills</h2>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {groups.map((group, idx) => {
          const color = groupColors[group.title] || "#ccc";
          const selected = selectedTab === idx;
          return (
            <button
              key={group.title}
              onClick={() => setSelectedTab(idx)}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: `2px solid ${color}`,
                background: color,
                color: "#fffefeff",
                fontWeight: selected ? "bold" : "normal",
                opacity: selected ? 1 : 0.7,
                cursor: "pointer",
                boxShadow: selected ? `0 2px 8px ${color}33` : "none",
                transition: "all 0.2s",
              }}
            >
              {group.title}
            </button>
          );
        })}
      </div>
      {/* Skills for selected tab */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groups[selectedTab].items.map((name, idx) => {
            const s = skills.find(
              (x) => x.name && x.name.toLowerCase() === name.toLowerCase()
            );
            const groupTitle = groups[selectedTab].title;
            const skillId = `${name}__${groupTitle}`;
            const isOpen = openReviewId === skillId;
            return (
              <SkillRow
                key={skillId}
                skill={s}
                name={name}
                group={groupTitle}
                onSaved={reload}
                email={"libin@quicksand.co.in"}
                onChange={onChange}
                skills={skills}
                reviewMode={isOpen}
                openReview={() => setOpenReviewId(skillId)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";

function SkillRow({
  skill,
  name,
  group,
  onSaved,
  email,
  onChange,
  skills,
  reviewMode,
  openReview,
}) {
  // Single value for level
  const getInitialLevel = () => {
    if (skill?.level3) return 3;
    if (skill?.level2) return 2;
    if (skill?.level1) return 1;
    return 0;
  };
  const [level, setLevel] = useState(getInitialLevel());

  // reviewMode and openReview are now props from parent

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

  function saveInstant(val) {
    setLevel(val); // update UI instantly
    const updatedForm = getLevels(val);

    // Update local skills state instantly
    let newSkills;
    if (skill) {
      // Update by name and group (not _id)
      newSkills = skills.map((s) =>
        s.name === name && s.group === group ? { ...s, ...updatedForm } : s
      );
    } else {
      // Add new skill locally
      newSkills = [...skills, { name, group, ...updatedForm }];
    }
    if (onChange) onChange(newSkills);
    if (onSaved) onSaved();
  }

  // Determine color based on group title
  const groupColors = {
    HCD: "#4269D0",
    "Project Management": "#EFB118",
    "Engagement & Communication / Business Development": "#FF725C",
    "Research & Development": "#3CA951",
  };
  const badgeColor = groupColors[group] || "#ccc";

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 18,
          alignItems: "center",
          paddingLeft: "2rem",
        }}
      >
        <div
          style={{
            flex: "0 0 260px",
            fontSize: "24px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {skill?.name ?? name}
        </div>

        {/* add a state variable to change stars to Review button */}
        {!reviewMode ? (
          <button style={{ cursor: "pointer" }} onClick={openReview}>
            {" "}
            Review{" "}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              onClick={() => saveInstant(0)}
              style={{
                cursor: "pointer",
                fontSize: 24,
                color: level === 0 ? "#888" : "#ccc",
                marginRight: 2,
                userSelect: "none",
                padding: "2px 6px",
                transition: "color 0.2s, border 0.2s, background 0.2s",
              }}
              title="Not yet tried"
            >
              &#9679;
            </span>
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
                &#9733;
              </span>
            ))}
          </div>
        )}
      </div>
      {/* add a state variable to show the below componenet for the id */}
      {reviewMode &&
        (() => {
          const desc = groups.find((g) => g.title === group)?.descriptions?.[
            name
          ];
          if (Array.isArray(desc)) {
            return (
              <ul
                style={{
                  margin: "10px 1px 0 0",
                  paddingLeft: 34,
                  fontSize: "15px",
                  color: "#464242ff",
                  maxWidth: 510,
                  lineHeight: 1.6,
                }}
              >
                {desc.map((d, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>
                    {d}
                  </li>
                ))}
              </ul>
            );
          } else if (desc) {
            return (
              <p
                style={{
                  margin: "6px 0 0 0",
                  paddingLeft: 34,
                  fontSize: "12px",
                  color: "#585454ff",
                  maxWidth: 510,
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </p>
            );
          } else {
            return null;
          }
        })()}
    </div>
  );
}
