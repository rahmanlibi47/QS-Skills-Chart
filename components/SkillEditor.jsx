"use client"

import { useState } from 'react'
import groups from '../lib/groups'

export default function SkillEditor({ skills = [], onChange, reload }) {

  const [form, setForm] = useState({ name: '', group: groups[0]?.title || '', level1: 0, level2: 0, level3: 0 })

  async function addSkill(e) {
    e.preventDefault()
    await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm({ name: '', group: groups[0]?.title || '', level1: 0, level2: 0, level3: 0 })
    if (reload) reload()
  }

  return (
    <div>
     

      <h2>Add Skills</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {groups.map(group => (
          <div key={group.title}>
            <h4>{group.title}</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {group.items.map(name => {
                const s = skills.find(x => x.name && x.name.toLowerCase() === name.toLowerCase())
                return <SkillRow key={name} skill={s} name={name} group={group.title} onSaved={reload} />
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillRow({ skill, name, group, onSaved }) {
  const [edit, setEdit] = useState(!skill)
  const [form, setForm] = useState({ level1: skill?.level1 ?? 0, level2: skill?.level2 ?? 0, level3: skill?.level3 ?? 0 })

  async function save() {
    if (skill && skill._id) {
      await fetch('/api/skills', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: skill._id, ...form }) })
    } else {
      await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, group, ...form }) })
    }
    setEdit(false)
    if (onSaved) onSaved()
  }

  async function remove() {
    if (!skill || !skill._id) return
    await fetch('/api/skills?id=' + skill._id, { method: 'DELETE' })
    if (onSaved) onSaved()
  }

  return (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
  <div style={{flex: '0 0 260px'}}>{skill?.name ?? name}</div>
      {edit ? (
        <>
          <input type="number" value={form.level1} onChange={e => setForm({...form, level1: Number(e.target.value)})} style={{width: 60}} />
          <input type="number" value={form.level2} onChange={e => setForm({...form, level2: Number(e.target.value)})} style={{width: 60}} />
          <input type="number" value={form.level3} onChange={e => setForm({...form, level3: Number(e.target.value)})} style={{width: 60}} />
          <button onClick={save}>Save</button>
          <button onClick={() => setEdit(false)}>Cancel</button>
        </>
      ) : (
        <>
          <div style={{display: 'inline-flex', gap: 6}}>
            <div style={{background: '#acacac', padding: '4px 8px', borderRadius: 12}}>{skill?.level1 ?? form.level1 ?? 0}</div>
            <div style={{background: '#f48458', padding: '4px 8px', borderRadius: 12}}>{skill?.level2 ?? form.level2 ?? 0}</div>
            <div style={{background: '#ea6071', padding: '4px 8px', borderRadius: 12}}>{skill?.level3 ?? form.level3 ?? 0}</div>
          </div>
          <button onClick={() => setEdit(true)}>Edit</button>
          <button onClick={remove}>Delete</button>
        </>
      )}
    </div>
  )
}
