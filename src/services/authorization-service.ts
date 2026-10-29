import { User, childrens, relationChildrens, parents } from '@/db'
import { eq, and, sql } from 'drizzle-orm'
import db from '@/configs/db'
import type { AuthenticatedUser } from '@/services/auth-service'
import { ApiError } from '@/utils/api-error'

export class AuthorizationService {
    canAccessUser(currentUser: User, targetUserId: string): boolean {
        if (currentUser.id === targetUserId) {
            return true
        }

        if (
            ['admin', 'posyandu_admin', 'village_admin'].includes(
                currentUser.role
            )
        ) {
            return true
        }

        return false
    }

    async canAccessChild(
        currentUser: AuthenticatedUser,
        childId: string
    ): Promise<boolean> {
        if (
            [
                'admin',
                'posyandu_admin',
                'village_admin',
                'midwife',
                'cadre'
            ].includes(currentUser.role)
        ) {
            const child = await db
                .select()
                .from(childrens)
                .where(
                    and(
                        eq(childrens.id, childId),
                        eq(childrens.is_deleted, false),
                        sql`${childrens.deleted_at} IS NULL`
                    )
                )
                .limit(1)

            if (child.length === 0 || !child[0]) {
                return false
            }

            if (
                currentUser.role === 'midwife' ||
                currentUser.role === 'cadre'
            ) {
                return child[0].posyandu_id === currentUser.posyandu_id
            }

            return true
        }

        if (currentUser.role === 'parent') {
            if (!currentUser.parent_id) {
                return false
            }

            const relation = await db
                .select()
                .from(relationChildrens)
                .innerJoin(parents, eq(relationChildrens.parent_id, parents.id))
                .where(
                    and(
                        eq(relationChildrens.children_id, childId),
                        eq(relationChildrens.parent_id, currentUser.parent_id),
                        eq(relationChildrens.is_deleted, false),
                        sql`${relationChildrens.deleted_at} IS NULL`,
                        eq(parents.status, 'active'),
                        eq(parents.is_deleted, false)
                    )
                )
                .limit(1)

            return relation.length > 0
        }

        return false
    }

    async requireChildAccess(
        currentUser: AuthenticatedUser,
        childId: string
    ): Promise<string> {
        if (!(await this.canAccessChild(currentUser, childId))) {
            throw ApiError.forbidden(
                'You do not have permission to access this child record'
            )
        }

        const [child] = await db
            .select({ posyandu_id: childrens.posyandu_id })
            .from(childrens)
            .where(eq(childrens.id, childId))
            .limit(1)

        if (!child) {
            throw ApiError.notFound('Child record not found')
        }

        return child.posyandu_id
    }

    async getChildPosyanduId(childId: string): Promise<string> {
        const [child] = await db
            .select({ posyandu_id: childrens.posyandu_id })
            .from(childrens)
            .where(
                and(
                    eq(childrens.id, childId),
                    eq(childrens.is_deleted, false),
                    sql`${childrens.deleted_at} IS NULL`
                )
            )
            .limit(1)

        if (!child) throw ApiError.notFound('Child record not found')
        return child.posyandu_id
    }

    requireAssignedPosyandu(
        currentUser: AuthenticatedUser,
        posyanduId: string | null | undefined
    ): void {
        if (
            (currentUser.role === 'cadre' || currentUser.role === 'midwife') &&
            (!posyanduId ||
                !(currentUser.posyandu_ids ?? []).includes(posyanduId))
        ) {
            throw ApiError.forbidden('You do not have access to this Posyandu')
        }
    }

    getAssignmentId(
        currentUser: AuthenticatedUser,
        posyanduId: string
    ): string | undefined {
        if (currentUser.role !== 'cadre' && currentUser.role !== 'midwife') {
            return undefined
        }

        return currentUser.posyandu_assignments?.find(
            assignment => assignment.posyandu_id === posyanduId
        )?.id
    }
}
