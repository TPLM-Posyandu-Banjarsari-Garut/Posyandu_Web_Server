import { createPaginationMeta } from '@/utils/pagination'
import { NewChildren, Children } from '@/db'
import {
    ChildrenRepository,
    ChildrenQueryFilters
} from '@/repositories/childrens-repository'
import { ParentRepository } from '@/repositories/parents-repository'

export class ChildrenService {
    constructor(
        private readonly children_repository: ChildrenRepository,
        private readonly parent_repository?: ParentRepository
    ) {}

    /**
     * Buat data bayi baru.
     * Jika parent_user_id diberikan (user.id ibu), akan dicari parent profile-nya
     * lalu disimpan relasinya ke tabel relation_childrens.
     */
    async createChildren(
        children_payload: NewChildren & { parent_user_id?: string | null }
    ): Promise<Children> {
        const isIdentityNumberUsed =
            await this.children_repository.existsByIdentityNumber(
                children_payload.identity_number
            )
        if (isIdentityNumberUsed) {
            throw new Error('Identity number (NIK) is already registered')
        }

        // Pisahkan parent_user_id dari data bayi
        const { parent_user_id, ...childData } = children_payload as any
        const child = await this.children_repository.create(childData)

        // Simpan relasi ke relation_childrens jika parent_user_id ada
        if (parent_user_id && this.parent_repository) {
            let parent = await this.parent_repository.findByUserId(parent_user_id)
            if (!parent) {
                parent = await this.parent_repository.create({ 
                    user_id: parent_user_id,
                    rt: null as any,
                    rw: null as any
                })
            }
            if (parent) {
                await this.children_repository.linkParent(child.id, parent.id)
            }
        }

        return child
    }

    async getChildrens(query_filters?: ChildrenQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.children_repository.getChildrens(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getChildrenById(public_id: string): Promise<Children & any> {
        const child = await this.children_repository.findById(public_id)
        if (!child) throw new Error('Children not found')
        return child
    }

    async getChildrenByParent(parent_id: string): Promise<Children[]> {
        return this.children_repository.findByParentId(parent_id)
    }

    /**
     * Update data bayi.
     * Jika parent_user_id diberikan (user.id ibu), relasi akan diperbarui.
     * Jika parent_user_id null/undefined, relasi tidak diubah.
     */
    async updateChildren(
        public_id: string,
        children_payload: Partial<NewChildren> & { parent_user_id?: string | null }
    ): Promise<Children> {
        const existingChild = await this.getChildrenById(public_id)

        if (
            children_payload.identity_number &&
            children_payload.identity_number !== existingChild.identity_number
        ) {
            const isIdentityNumberUsed =
                await this.children_repository.existsByIdentityNumber(
                    children_payload.identity_number
                )
            if (isIdentityNumberUsed) {
                throw new Error(
                    'Identity number (NIK) is already registered by another child'
                )
            }
        }

        // Pisahkan parent_user_id dari data update
        const { parent_user_id, ...childData } = children_payload as any
        const updated = await this.children_repository.update(
            public_id,
            childData
        )
        if (!updated) throw new Error('Failed to update children data')

        // Update relasi ke relation_childrens jika parent_user_id diberikan
        if (parent_user_id !== undefined && this.parent_repository) {
            if (parent_user_id === null || parent_user_id === '') {
                // Hapus relasi jika dikirimkan null/empty
                await this.children_repository.unlinkParent(public_id)
            } else {
                let parent = await this.parent_repository.findByUserId(parent_user_id)
                if (!parent) {
                    parent = await this.parent_repository.create({ 
                        user_id: parent_user_id,
                        rt: null as any,
                        rw: null as any
                    })
                }
                if (parent) {
                    await this.children_repository.linkParent(updated.id, parent.id)
                }
            }
        }

        return updated
    }

    async deleteChildren(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Children> {
        await this.getChildrenById(public_id)

        const deleted = is_permanent
            ? await this.children_repository.hardDelete(public_id)
            : await this.children_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete children data')
        return deleted
    }

    async restoreChildren(public_id: string): Promise<Children> {
        const restored = await this.children_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore children data')
        return restored
    }

    async verifyParentAccess(
        public_id: string,
        parent_id: string
    ): Promise<boolean> {
        const parentChildren =
            await this.children_repository.findByParentId(parent_id)

        const hasAccess = parentChildren.some(child => child.id === public_id)

        if (!hasAccess) {
            throw new Error(
                'Unauthorized access: This children record does not belong to the user'
            )
        }
        return true
    }
}
