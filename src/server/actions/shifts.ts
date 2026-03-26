"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { canManageSchedule } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import { addWeeks, startOfWeek, endOfWeek, addDays, format, getDay } from "date-fns";

export async function createShift(data: {
  employeeId?: string;
  title?: string;
  startTime: string;
  endTime: string;
  isRecurring?: boolean;
  recurrenceWeeks?: number;
  notes?: string;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to create shifts" };
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (endTime <= startTime) {
    return { success: false, error: "End time must be after start time" };
  }

  if (data.isRecurring && data.recurrenceWeeks && data.recurrenceWeeks > 0) {
    const recurrenceGroupId = crypto.randomUUID();
    const shifts = [];

    for (let i = 0; i < data.recurrenceWeeks; i++) {
      shifts.push({
        organizationId: session.user.organizationId,
        employeeId: data.employeeId || null,
        createdById: session.user.id,
        title: data.title || null,
        startTime: addWeeks(startTime, i),
        endTime: addWeeks(endTime, i),
        isRecurring: true,
        recurrenceGroupId,
        notes: data.notes || null,
      });
    }

    await db.shift.createMany({ data: shifts });
  } else {
    await db.shift.create({
      data: {
        organizationId: session.user.organizationId,
        employeeId: data.employeeId || null,
        createdById: session.user.id,
        title: data.title || null,
        startTime,
        endTime,
        notes: data.notes || null,
      },
    });
  }

  revalidatePath("/schedule");
  return { success: true };
}

export async function updateShift(
  shiftId: string,
  data: {
    employeeId?: string | null;
    title?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  },
  updateFuture?: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to edit shifts" };
  }

  const shift = await db.shift.findFirst({
    where: { id: shiftId, organizationId: session.user.organizationId },
  });

  if (!shift) return { success: false, error: "Shift not found" };

  const updateData: Record<string, unknown> = {};
  if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.startTime) updateData.startTime = new Date(data.startTime);
  if (data.endTime) updateData.endTime = new Date(data.endTime);
  if (data.notes !== undefined) updateData.notes = data.notes;

  if (updateFuture && shift.recurrenceGroupId) {
    await db.shift.updateMany({
      where: {
        recurrenceGroupId: shift.recurrenceGroupId,
        startTime: { gte: shift.startTime },
      },
      data: {
        employeeId: data.employeeId !== undefined ? data.employeeId : undefined,
        title: data.title !== undefined ? data.title : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
      },
    });
  } else {
    await db.shift.update({
      where: { id: shiftId },
      data: updateData,
    });
  }

  revalidatePath("/schedule");
  return { success: true };
}

export async function deleteShift(
  shiftId: string,
  deleteFuture?: boolean
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to delete shifts" };
  }

  const shift = await db.shift.findFirst({
    where: { id: shiftId, organizationId: session.user.organizationId },
  });

  if (!shift) return { success: false, error: "Shift not found" };

  if (deleteFuture && shift.recurrenceGroupId) {
    await db.shift.deleteMany({
      where: {
        recurrenceGroupId: shift.recurrenceGroupId,
        startTime: { gte: shift.startTime },
      },
    });
  } else {
    await db.shift.delete({ where: { id: shiftId } });
  }

  revalidatePath("/schedule");
  return { success: true };
}

export async function copyLastWeekSchedule(
  weekStartStr: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to manage schedules" };
  }

  const targetWeekStart = startOfWeek(new Date(weekStartStr), { weekStartsOn: 0 });
  const prevWeekStart = addDays(targetWeekStart, -7);
  const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 0 });

  const prevShifts = await db.shift.findMany({
    where: {
      organizationId: session.user.organizationId,
      startTime: { gte: prevWeekStart },
      endTime: { lte: addDays(prevWeekEnd, 1) },
    },
  });

  if (prevShifts.length === 0) {
    return { success: false, error: "No shifts found in the previous week" };
  }

  const newShifts = prevShifts.map((shift) => ({
    organizationId: session.user.organizationId,
    employeeId: shift.employeeId,
    createdById: session.user.id,
    title: shift.title,
    startTime: addDays(shift.startTime, 7),
    endTime: addDays(shift.endTime, 7),
    notes: shift.notes,
  }));

  await db.shift.createMany({ data: newShifts });

  revalidatePath("/schedule");
  return { success: true };
}

export async function saveAsTemplate(
  weekStartStr: string,
  name: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to manage schedules" };
  }

  const weekStart = startOfWeek(new Date(weekStartStr), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });

  const shifts = await db.shift.findMany({
    where: {
      organizationId: session.user.organizationId,
      startTime: { gte: weekStart },
      endTime: { lte: addDays(weekEnd, 1) },
    },
  });

  if (shifts.length === 0) {
    return { success: false, error: "No shifts found in this week to save" };
  }

  await db.scheduleTemplate.create({
    data: {
      name,
      organizationId: session.user.organizationId,
      createdById: session.user.id,
      shifts: {
        create: shifts.map((shift) => ({
          employeeId: shift.employeeId,
          dayOfWeek: getDay(shift.startTime),
          startTime: format(shift.startTime, "HH:mm"),
          endTime: format(shift.endTime, "HH:mm"),
          title: shift.title,
          notes: shift.notes,
        })),
      },
    },
  });

  return { success: true };
}

export async function applyTemplate(
  templateId: string,
  weekStartStr: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to manage schedules" };
  }

  const template = await db.scheduleTemplate.findFirst({
    where: { id: templateId, organizationId: session.user.organizationId },
    include: { shifts: true },
  });

  if (!template) return { success: false, error: "Template not found" };

  const weekStart = startOfWeek(new Date(weekStartStr), { weekStartsOn: 0 });

  const newShifts = template.shifts.map((ts) => {
    const day = addDays(weekStart, ts.dayOfWeek);
    const [startH, startM] = ts.startTime.split(":").map(Number);
    const [endH, endM] = ts.endTime.split(":").map(Number);

    const shiftStart = new Date(day);
    shiftStart.setHours(startH, startM, 0, 0);

    const shiftEnd = new Date(day);
    shiftEnd.setHours(endH, endM, 0, 0);

    return {
      organizationId: session.user.organizationId,
      employeeId: ts.employeeId,
      createdById: session.user.id,
      title: ts.title,
      startTime: shiftStart,
      endTime: shiftEnd,
      notes: ts.notes,
    };
  });

  await db.shift.createMany({ data: newShifts });

  revalidatePath("/schedule");
  return { success: true };
}

export async function deleteTemplate(
  templateId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  if (!canManageSchedule(session.user.role)) {
    return { success: false, error: "You don't have permission to manage schedules" };
  }

  await db.scheduleTemplate.delete({
    where: { id: templateId, organizationId: session.user.organizationId },
  });

  return { success: true };
}
