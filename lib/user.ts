import argon2 from "argon2";
import { prisma } from '@/lib/prisma';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    const verify = await argon2.verify(hash, password);

    return verify;
  } catch (error) {
    return false;
  }
}

export async function getUserFromDbByEmail(email: string) {
  const userData = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  return userData;
}

export async function getUserFromDb(id: string) {
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
  });


  return userData;
}