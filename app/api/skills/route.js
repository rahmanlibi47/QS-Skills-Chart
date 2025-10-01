import { NextResponse } from "next/server";
import connect from "../../../lib/mongodb";
import Employee from "../../../models/Employee";

connect();

export async function GET(req) {
   console.log("GET /api/skills called");
   console.log("GET /api/skills called", req);
  try {
    // Get email from query params
    const { searchParams } = new URL(
      "http://localhost" +
        (typeof req !== "undefined" && req.url ? req.url : "")
    );
    const email = searchParams.get("email");
    console.log("GET email:", email);
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    const employee = await Employee.findOne({ email }).lean();
    if (!employee) return NextResponse.json([]);
    return NextResponse.json(employee.skills || []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("POST body ", body);

    const { email, ...skillData } = body;
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }
    let employee = await Employee.findOne({ email });
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    employee.skills.push(skillData);
    await employee.save();
    return NextResponse.json(skillData);
  } catch (err) {
    console.error("POST /api/skills error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  console.log("PATCH /api/skills req:", req);
  try {
    const body = await req.json();
    const { email, _id, ...skillData } = body;
    console.log("PATCH body:", body);
    if (!email || !_id)
      return NextResponse.json(
        { error: "Missing email or _id" },
        { status: 400 }
      );
    const employee = await Employee.findOne({ email });
    if (!employee)
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    const skillIndex = employee.skills.findIndex(
      (s) => s._id.toString() === _id
    );
    if (skillIndex === -1)
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    employee.skills[skillIndex] = {
      ...employee.skills[skillIndex].toObject(),
      ...skillData,
    };
    await employee.save();
    return NextResponse.json(employee.skills[skillIndex]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    if (!id || !email)
      return NextResponse.json(
        { error: "Missing id or email" },
        { status: 400 }
      );
    const employee = await Employee.findOne({ email });
    if (!employee)
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    employee.skills = employee.skills.filter((s) => s._id.toString() !== id);
    await employee.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
