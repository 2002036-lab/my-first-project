"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";

export async function upsertMedianIncomeAction(formData: FormData) {
  await requireUser();

  const year = parseInt(String(formData.get("year")), 10);
  const householdSize = parseFloat(String(formData.get("householdSize")));
  const monthlyAmount = parseFloat(String(formData.get("monthlyAmount")));

  if (!Number.isFinite(year) || !Number.isFinite(householdSize) || !Number.isFinite(monthlyAmount)) {
    throw new Error("입력값을 확인해주세요.");
  }

  await prisma.medianIncomeStandard.upsert({
    where: { year_householdSize: { year, householdSize } },
    update: { monthlyAmount },
    create: { year, householdSize, monthlyAmount },
  });

  revalidatePath("/settings");
}

export async function deleteMedianIncomeAction(id: string) {
  await requireUser();
  await prisma.medianIncomeStandard.delete({ where: { id } });
  revalidatePath("/settings");
}
