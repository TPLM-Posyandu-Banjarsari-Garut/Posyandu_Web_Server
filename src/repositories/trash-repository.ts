import {
    users,
    childrens,
    posyandus,
    educations,
    educationCategories,
    vaccines,
    vitamins,
    pregnancyRecords,
    nutritionRecords,
    vitaminRecords,
    immunizationRecords,
    kipiDetails,
    examinationSchedules,
    examinationRecords,
    examinations,
    inventories
} from '@/db'
import { and, eq, ilike, isNotNull, or, desc, sql, SQL } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { UserRepository } from '@/repositories/user-repository'

export interface TrashItem {
    id: string
    type:
        | 'user'
        | 'children'
        | 'posyandu'
        | 'education'
        | 'education_category'
        | 'vaccine'
        | 'vitamin'
        | 'pregnancy_record'
        | 'nutrition_record'
        | 'vitamin_record'
        | 'immunization_record'
        | 'kipi_detail'
        | 'examination_schedule'
        | 'examination_record'
        | 'examination'
        | 'inventory'
    name: string
    deleted_at: Date
    details: Record<string, unknown>
}

export interface TrashQueryFilters {
    type?: TrashItem['type']
    search?: string
    page?: number
    limit?: number
}

const trashConfigs: Array<{
    type: TrashItem['type']
    table: PgTable & { id: PgColumn }
    orderByColumn: PgColumn | SQL
    restoreFields?: Record<string, unknown>
    filter: (search?: string) => SQL | undefined
    format: (row: Record<string, unknown>) => Omit<TrashItem, 'id' | 'type'>
}> = [
    {
        type: 'user',
        table: users,
        orderByColumn: users.updated_at,
        filter: search =>
            and(
                eq(users.status, 'inactive'),
                search
                    ? or(
                          ilike(users.name, `%${search}%`),
                          ilike(users.email, `%${search}%`)
                      )
                    : undefined
            ),
        format: row => {
            const u = row as unknown as typeof users.$inferSelect
            return {
                name: u.name,
                deleted_at: u.updated_at || new Date(),
                details: {
                    email: u.email,
                    role: u.role,
                    phone_number: u.phone_number
                }
            }
        }
    },
    {
        type: 'children',
        table: childrens,
        orderByColumn: childrens.deleted_at,
        restoreFields: { deleted_at: null },
        filter: search =>
            and(
                isNotNull(childrens.deleted_at),
                search ? ilike(childrens.name, `%${search}%`) : undefined
            ),
        format: row => {
            const c = row as unknown as typeof childrens.$inferSelect
            return {
                name: c.name,
                deleted_at: c.deleted_at || new Date(),
                details: {
                    identity_number: c.identity_number,
                    gender: c.gender
                }
            }
        }
    },
    {
        type: 'posyandu',
        table: posyandus,
        orderByColumn: posyandus.updated_at,
        restoreFields: { status: 'active' },
        filter: search =>
            and(
                eq(posyandus.status, 'inactive'),
                search ? ilike(posyandus.name, `%${search}%`) : undefined
            ),
        format: row => {
            const p = row as unknown as typeof posyandus.$inferSelect
            return {
                name: p.name,
                deleted_at: p.updated_at || new Date(),
                details: {
                    address: p.address_line,
                    village_name: p.village_name
                }
            }
        }
    },
    {
        type: 'education',
        table: educations,
        orderByColumn: educations.deleted_at,
        restoreFields: { status: 'active', deleted_at: null },
        filter: search =>
            and(
                or(
                    eq(educations.status, 'inactive'),
                    isNotNull(educations.deleted_at)
                ),
                search
                    ? or(
                          ilike(educations.title, `%${search}%`),
                          ilike(educations.summary, `%${search}%`)
                      )
                    : undefined
            ),
        format: row => {
            const e = row as unknown as typeof educations.$inferSelect
            return {
                name: e.title,
                deleted_at: e.deleted_at || e.updated_at || new Date(),
                details: { summary: e.summary, status: e.status }
            }
        }
    },
    {
        type: 'education_category',
        table: educationCategories,
        orderByColumn: educationCategories.updated_at,
        restoreFields: { status: 'active' },
        filter: search =>
            and(
                eq(educationCategories.status, 'inactive'),
                search
                    ? ilike(educationCategories.name, `%${search}%`)
                    : undefined
            ),
        format: row => {
            const ec = row as unknown as typeof educationCategories.$inferSelect
            return {
                name: ec.name,
                deleted_at: ec.updated_at || new Date(),
                details: { description: ec.description }
            }
        }
    },
    {
        type: 'vaccine',
        table: vaccines,
        orderByColumn: vaccines.deleted_at,
        restoreFields: { deleted_at: null },
        filter: search =>
            and(
                isNotNull(vaccines.deleted_at),
                search ? ilike(vaccines.name, `%${search}%`) : undefined
            ),
        format: row => {
            const v = row as unknown as typeof vaccines.$inferSelect
            return {
                name: v.name,
                deleted_at: v.updated_at || new Date(),
                details: { code: v.code, description: v.description }
            }
        }
    },
    {
        type: 'vitamin',
        table: vitamins,
        orderByColumn: vitamins.deleted_at,
        restoreFields: { deleted_at: null },
        filter: search =>
            and(
                isNotNull(vitamins.deleted_at),
                search ? ilike(vitamins.name, `%${search}%`) : undefined
            ),
        format: row => {
            const vt = row as unknown as typeof vitamins.$inferSelect
            return {
                name: vt.name,
                deleted_at: vt.updated_at || new Date(),
                details: {
                    capsule_color: vt.capsule_color,
                    dosage_iu: vt.dosage_iu
                }
            }
        }
    },
    {
        type: 'pregnancy_record',
        table: pregnancyRecords,
        orderByColumn: pregnancyRecords.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(pregnancyRecords.deleted_at),
        format: row => {
            const pr = row as unknown as typeof pregnancyRecords.$inferSelect
            return {
                name: `Pregnancy Record (${pr.id})`,
                deleted_at: pr.deleted_at || new Date(),
                details: {
                    last_menstrual_period: pr.last_menstrual_period,
                    estimated_due_date: pr.estimated_due_date
                }
            }
        }
    },
    {
        type: 'nutrition_record',
        table: nutritionRecords,
        orderByColumn: nutritionRecords.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(nutritionRecords.deleted_at),
        format: row => {
            const nr = row as unknown as typeof nutritionRecords.$inferSelect
            return {
                name: `Nutrition Record (${nr.id})`,
                deleted_at: nr.deleted_at || new Date(),
                details: { weight: nr.weight_kg, height: nr.height_cm }
            }
        }
    },
    {
        type: 'vitamin_record',
        table: vitaminRecords,
        orderByColumn: vitaminRecords.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(vitaminRecords.deleted_at),
        format: row => {
            const vr = row as unknown as typeof vitaminRecords.$inferSelect
            return {
                name: `Vitamin Record (${vr.id})`,
                deleted_at: vr.deleted_at || new Date(),
                details: {
                    status: vr.status,
                    distribution_period: vr.distribution_period
                }
            }
        }
    },
    {
        type: 'immunization_record',
        table: immunizationRecords,
        orderByColumn: immunizationRecords.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(immunizationRecords.deleted_at),
        format: row => {
            const ir = row as unknown as typeof immunizationRecords.$inferSelect
            return {
                name: `Immunization Record (${ir.id})`,
                deleted_at: ir.deleted_at || new Date(),
                details: { status: ir.status }
            }
        }
    },
    {
        type: 'kipi_detail',
        table: kipiDetails,
        orderByColumn: kipiDetails.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(kipiDetails.deleted_at),
        format: row => {
            const kd = row as unknown as typeof kipiDetails.$inferSelect
            return {
                name: `KIPI Detail (${kd.id})`,
                deleted_at: kd.deleted_at || new Date(),
                details: { symptoms: kd.symptoms, severity: kd.severity }
            }
        }
    },
    {
        type: 'examination_schedule',
        table: examinationSchedules,
        orderByColumn: examinationSchedules.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(examinationSchedules.deleted_at),
        format: row => {
            const es =
                row as unknown as typeof examinationSchedules.$inferSelect
            return {
                name: `Schedule (${es.scheduled_date})`,
                deleted_at: es.deleted_at || new Date(),
                details: {
                    scheduled_date: es.scheduled_date,
                    status: es.status
                }
            }
        }
    },
    {
        type: 'examination_record',
        table: examinationRecords,
        orderByColumn: examinationRecords.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(examinationRecords.deleted_at),
        format: row => {
            const er = row as unknown as typeof examinationRecords.$inferSelect
            return {
                name: `Examination Record (${er.id})`,
                deleted_at: er.deleted_at || new Date(),
                details: { examination_date: er.examination_date }
            }
        }
    },
    {
        type: 'examination',
        table: examinations,
        orderByColumn: examinations.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(examinations.deleted_at),
        format: row => {
            const ex = row as unknown as typeof examinations.$inferSelect
            return {
                name: ex.name,
                deleted_at: ex.deleted_at || new Date(),
                details: { examination_type: ex.examination_type }
            }
        }
    },
    {
        type: 'inventory',
        table: inventories,
        orderByColumn: inventories.deleted_at,
        restoreFields: { deleted_at: null },
        filter: () => isNotNull(inventories.deleted_at),
        format: row => {
            const i = row as unknown as typeof inventories.$inferSelect
            return {
                name: i.item_name,
                deleted_at: i.deleted_at || new Date(),
                details: { quantity: i.quantity, unit: i.unit }
            }
        }
    }
]

export class TrashRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async getTrashItems(
        filters?: TrashQueryFilters
    ): Promise<{ data: TrashItem[]; totalItems: number }> {
        const { type, search, page = 1, limit = 10 } = filters || {}
        const offset = (page - 1) * limit
        const fetchLimit = offset + limit

        const targets = type
            ? trashConfigs.filter(c => c.type === type)
            : trashConfigs

        const queriesResults = await Promise.all(
            targets.map(async config => {
                const [rows, countResult] = await Promise.all([
                    this.db
                        .select()
                        .from(config.table)
                        .where(config.filter(search))
                        .orderBy(desc(config.orderByColumn))
                        .limit(fetchLimit),
                    this.db
                        .select({ count: sql<number>`count(*)` })
                        .from(config.table)
                        .where(config.filter(search))
                ])

                const count = Number(countResult[0]?.count || 0)
                const items = rows.map(
                    (row): TrashItem => ({
                        id: (row as { id: string }).id,
                        type: config.type,
                        ...config.format(row as Record<string, unknown>)
                    })
                )

                return { items, count }
            })
        )

        const allItems: TrashItem[] = []
        let totalItems = 0

        for (const res of queriesResults) {
            allItems.push(...res.items)
            totalItems += res.count
        }

        allItems.sort((a, b) => b.deleted_at.getTime() - a.deleted_at.getTime())

        return {
            data: allItems.slice(offset, offset + limit),
            totalItems
        }
    }

    async restore(type: TrashItem['type'], id: string): Promise<unknown> {
        if (type === 'user') {
            const userRepository = new UserRepository(this.db)
            return await userRepository.restore(id)
        }

        const config = trashConfigs.find(c => c.type === type)
        if (!config?.restoreFields) throw new Error('Unsupported entity type')

        const [restored] = await this.db
            .update(config.table)
            .set(config.restoreFields)
            .where(eq(config.table.id, id))
            .returning()

        return restored
    }
}
