import { User, childrens, relationChildrens } from '@/db'
import { eq, and } from 'drizzle-orm'
import db from '@/configs/db'
import { AuthenticatedUser } from '@/services/auth-service'

export class AuthorizationService {
    canAccessUser(currentUser: User, targetUserId: string): boolean {
        if (currentUser.id === targetUserId) {
            return true
        }

        if (['admin', 'posyandu_admin'].includes(currentUser.role)) {
            return true
        }

        return false
    }

    async canAccessChild(
        currentUser: AuthenticatedUser,
        childId: string
    ): Promise<boolean> {
        if (
            ['admin', 'posyandu_admin', 'midwife', 'cadre'].includes(
                currentUser.role
            )
        ) {
            const child = await db
                .select()
                .from(childrens)
                .where(eq(childrens.id, childId))
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
                .where(
                    and(
                        eq(relationChildrens.children_id, childId),
                        eq(relationChildrens.parent_id, currentUser.parent_id)
                    )
                )
                .limit(1)

            return relation.length > 0
        }

        return false
    }
}
