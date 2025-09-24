import { NextResponse } from 'next/server'
import connect from '../../../lib/mongodb'
import Skill from '../../../models/Skill'

connect()

export async function GET() {
  try {
    const skills = await Skill.find({}).lean()
    return NextResponse.json(skills)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const skill = new Skill(body)
    await skill.save()
    return NextResponse.json(skill)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json()
    if (!body._id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 })
    const updated = await Skill.findByIdAndUpdate(body._id, body, { new: true })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await Skill.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
