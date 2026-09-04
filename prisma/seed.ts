import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

interface CreditorSeed {
  name: string;
  address: string | null;
  phone: string | null;
  zipCode: string | null;
}

async function seedCreditors() {
  const filePath = path.join(__dirname, "seed-data", "creditors.json");
  const creditors: CreditorSeed[] = JSON.parse(readFileSync(filePath, "utf-8"));

  console.log(`채권자 마스터 ${creditors.length}건 시딩 중...`);
  for (const c of creditors) {
    await prisma.creditor.upsert({
      where: { name: c.name },
      update: { address: c.address, phone: c.phone, zipCode: c.zipCode },
      create: c,
    });
  }
  console.log("채권자 마스터 시딩 완료.");
}

async function seedOfficeAndAdmin() {
  const officeName = process.env.SEED_OFFICE_NAME || "우리 법무사 사무실";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123!";
  const adminName = process.env.SEED_ADMIN_NAME || "관리자";

  let office = await prisma.office.findFirst({ where: { name: officeName } });
  if (!office) {
    office = await prisma.office.create({ data: { name: officeName } });
    console.log(`사무실 생성: ${office.name}`);
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        officeId: office.id,
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`관리자 계정 생성: ${adminEmail} (초기 비밀번호: ${adminPassword})`);
  } else {
    console.log(`관리자 계정이 이미 존재합니다: ${adminEmail}`);
  }
}

async function seedMedianIncomeStandard() {
  // 예시값입니다. 실제 신청 서류에는 반드시 그 해의 공식 '기준중위소득' 고시값으로
  // 확인/수정 후 사용해야 합니다. (보건복지부 매년 8월경 고시)
  const count = await prisma.medianIncomeStandard.count();
  if (count > 0) return;

  const year = new Date().getFullYear();
  const placeholderRows = [
    { householdSize: 1, monthlyAmount: 0 },
    { householdSize: 1.5, monthlyAmount: 0 },
    { householdSize: 2, monthlyAmount: 0 },
    { householdSize: 2.5, monthlyAmount: 0 },
    { householdSize: 3, monthlyAmount: 0 },
    { householdSize: 3.5, monthlyAmount: 0 },
    { householdSize: 4, monthlyAmount: 0 },
  ];
  await prisma.medianIncomeStandard.createMany({
    data: placeholderRows.map((r) => ({ year, ...r })),
  });
  console.log(
    `기준중위소득표(${year}년) 자리표시자 생성 완료 - 반드시 설정 화면에서 실제 고시 금액으로 수정하세요.`
  );
}

async function main() {
  await seedOfficeAndAdmin();
  await seedCreditors();
  await seedMedianIncomeStandard();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
