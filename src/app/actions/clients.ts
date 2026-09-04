"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";

export async function createClientAction(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("이름은 필수입니다.");

  const client = await prisma.client.create({
    data: {
      officeId: user.officeId,
      name,
      residentNo: emptyToNull(formData.get("residentNo")),
      phone: emptyToNull(formData.get("phone")),
      address: emptyToNull(formData.get("address")),
      email: emptyToNull(formData.get("email")),
      memo: emptyToNull(formData.get("memo")),
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const user = await requireUser();

  await prisma.client.update({
    where: { id: clientId, officeId: user.officeId },
    data: {
      name: String(formData.get("name") || "").trim(),
      residentNo: emptyToNull(formData.get("residentNo")),
      phone: emptyToNull(formData.get("phone")),
      address: emptyToNull(formData.get("address")),
      email: emptyToNull(formData.get("email")),
      memo: emptyToNull(formData.get("memo")),
    },
  });

  revalidatePath(`/clients/${clientId}`);
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}
