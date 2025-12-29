import {Admin} from "../models/admin.js";

export async function checkAdmin(admin) {
  try {
    const cand = await Admin.findById(admin.id);
    return cand.role === "Admin";
  } catch (error) {
    return false;
  }
}
