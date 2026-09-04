import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { SCHEMA_STATEMENTS } from "@/lib/setup/schemaStatements";
import creditorsData from "../../../../prisma/seed-data/creditors.json";

// Postgres error codes for "already exists" (표/인덱스/타입/제약조건 등)
const ALREADY_EXISTS_CODES = new Set(["42P07", "42710", "42P16", "42P06"]);

interface CreditorSeed {
  name: string;
  address: string | null;
  phone: string | null;
  zipCode: string | null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "AUTH_SECRET 환경변수가 설정되어 있지 않습니다. 먼저 설정해주세요." },
      { status: 500 }
    );
  }

  if (key !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "key가 올바르지 않습니다." }, { status: 401 });
  }

  const log: string[] = [];

  // 1. 스키마(테이블) 생성 - 이미 있으면 건너뜀
  for (const statement of SCHEMA_STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (e) {
      const err = e as { code?: string; meta?: { code?: string } };
      const code = err.meta?.code ?? err.code;
      if (code && ALREADY_EXISTS_CODES.has(code)) {
        continue;
      }
      log.push(`SQL 실패: ${statement.slice(0, 60)}... -> ${(e as Error).message}`);
      return NextResponse.json({ error: "스키마 생성 중 오류", detail: log }, { status: 500 });
    }
  }
  log.push("테이블 생성 완료(또는 이미 존재).");

  // 2. 사무실 + 관리자 계정
  const officeName = process.env.SEED_OFFICE_NAME || "우리 법무사 사무실";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123!";
  const adminName = process.env.SEED_ADMIN_NAME || "관리자";

  let office = await prisma.office.findFirst({ where: { name: officeName } });
  if (!office) {
    office = await prisma.office.create({ data: { name: officeName } });
    log.push(`사무실 생성: ${office.name}`);
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: { officeId: office.id, name: adminName, email: adminEmail, passwordHash, role: "ADMIN" },
    });
    log.push(`관리자 계정 생성: ${adminEmail}`);
  } else {
    log.push("관리자 계정이 이미 존재합니다.");
  }

  // 3. 채권자 마스터
  const creditorCount = await prisma.creditor.count();
  if (creditorCount === 0) {
    const creditors = creditorsData as CreditorSeed[];
    await prisma.creditor.createMany({ data: creditors, skipDuplicates: true });
    log.push(`채권자 마스터 ${creditors.length}건 시딩 완료.`);
  } else {
    log.push(`채권자 마스터가 이미 ${creditorCount}건 있어 건너뜁니다.`);
  }

  // 4. 기준중위소득표 자리표시자
  const medianCount = await prisma.medianIncomeStandard.count();
  if (medianCount === 0) {
    const year = new Date().getFullYear();
    const sizes = [1, 1.5, 2, 2.5, 3, 3.5, 4];
    await prisma.medianIncomeStandard.createMany({
      data: sizes.map((householdSize) => ({ year, householdSize, monthlyAmount: 0 })),
    });
    log.push(`기준중위소득표(${year}년) 자리표시자 생성 완료.`);
  } else {
    log.push("기준중위소득표가 이미 있어 건너뜁니다.");
  }

  return NextResponse.json({ ok: true, log });
}
