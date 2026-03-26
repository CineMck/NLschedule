"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export type ProfileData = {
  name: string;
  email: string;
  birthday: string | null;
  phone: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
};

export async function getProfile(): Promise<ActionResult<ProfileData>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      birthday: true,
      phone: true,
      addressStreet: true,
      addressCity: true,
      addressState: true,
      addressZip: true,
    },
  });

  if (!user) return { success: false, error: "User not found" };

  return {
    success: true,
    data: {
      ...user,
      birthday: user.birthday ? user.birthday.toISOString().split("T")[0] : null,
    },
  };
}

export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult<{ sessionStale: boolean }>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, birthday, phone, addressStreet, addressCity, addressState, addressZip } =
    parsed.data;

  // Check email uniqueness within the organization
  if (email !== session.user.email) {
    const existing = await db.user.findFirst({
      where: {
        email,
        organizationId: session.user.organizationId,
        NOT: { id: session.user.id },
      },
    });
    if (existing) {
      return { success: false, error: "A user with this email already exists in your organization" };
    }
  }

  const sessionStale = name !== session.user.name || email !== session.user.email;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email,
      birthday: birthday ? new Date(birthday) : null,
      phone: phone || null,
      addressStreet: addressStreet || null,
      addressCity: addressCity || null,
      addressState: addressState || null,
      addressZip: addressZip || null,
    },
  });

  revalidatePath("/profile");
  return { success: true, data: { sessionStale } };
}
