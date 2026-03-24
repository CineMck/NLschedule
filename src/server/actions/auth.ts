"use server";

import { db } from "@/server/db";
import { signupSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import type { ActionResult } from "@/types";

export async function signUp(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    inviteCode: formData.get("inviteCode") as string,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, inviteCode } = parsed.data;

  const invitation = await db.invitation.findUnique({
    where: { inviteCode },
  });

  if (!invitation) {
    return { success: false, error: "Invalid invite code" };
  }

  if (invitation.acceptedAt) {
    return { success: false, error: "This invite code has already been used" };
  }

  if (new Date() > invitation.expiresAt) {
    return { success: false, error: "This invite code has expired" };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email_organizationId: {
        email,
        organizationId: invitation.organizationId,
      },
    },
  });

  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: invitation.role,
        organizationId: invitation.organizationId,
      },
    }),
    db.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return { success: true };
}
