import { prisma } from '@/lib/db/prisma';
import type { AuditAction, Prisma } from '@prisma/client';

export async function logAdminAction(payload: {
  actorEmail?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: Prisma.JsonValue | null;
  after?: Prisma.JsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        before: payload.before ?? undefined,
        after: payload.after ?? undefined,
        ipAddress: payload.ipAddress ?? undefined,
        userAgent: payload.userAgent ?? undefined,
      },
    });
  } catch (err) {
    console.warn('Failed to write admin action log:', err);
  }
}
