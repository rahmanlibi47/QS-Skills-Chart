"use client";

import { useState } from "react";
import groups from "../lib/groups";

export default function SkillEditor({ skills = [], onChange, reload }) {
  const [form, setForm] = useState({
    name: "",
    group: groups[0]?.title || "",
    level1: 0,
    level2: 0,
    level3: 0,
  });

  async function addSkill(e) {
    e.preventDefault();
    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      name: "",
      group: groups[0]?.title || "",
      level1: 0,
      level2: 0,
      level3: 0,
    });
    if (reload) reload();
  }

  return (
    <div>
      <h2>Add Skills</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((group) => (
          <div key={group.title}>
            <h4>{group.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.items.map((name) => {
                const s = skills.find(
                  (x) => x.name && x.name.toLowerCase() === name.toLowerCase()
                );
                return (
                  <SkillRow
                    key={name}
                    skill={s}
                    name={name}
                    group={group.title}
                    onSaved={reload}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect } from "react";

function SkillRow({ skill, name, group, onSaved }) {
  const [form, setForm] = useState({
    level1: skill?.level1 ?? 0,
    level2: skill?.level2 ?? 0,
    level3: skill?.level3 ?? 0,
  });

  useEffect(() => {
    setForm({
      level1: skill?.level1 ?? 0,
      level2: skill?.level2 ?? 0,
      level3: skill?.level3 ?? 0,
    });
  }, [skill?.level1, skill?.level2, skill?.level3]);

  async function saveInstant(updatedForm) {
    setForm(updatedForm);
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

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ flex: "0 0 260px" }}>{skill?.name ?? name}</div>
      <input
        type="number"
        value={form.level1}
        min={0}
        max={3}
        defaultValue={0}
        onChange={(e) =>
          saveInstant({ ...form, level1: Math.max(0, Math.min(3, Number(e.target.value))) })
        }
        style={{ width: 60 }}
      />
      <input
        type="number"
        value={form.level2}
        min={0}
        max={3}
        defaultValue={0}
        onChange={(e) =>
          saveInstant({ ...form, level2: Math.max(0, Math.min(3, Number(e.target.value))) })
        }
        style={{ width: 60 }}
      />
      <input
        type="number"
        value={form.level3}
        min={0}
        max={3}
        defaultValue={0}
        onChange={(e) =>
          saveInstant({ ...form, level3: Math.max(0, Math.min(3, Number(e.target.value))) })
        }
        style={{ width: 60 }}
      />
    </div>
  );
}
