import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { eq, SQL, sql } from 'drizzle-orm'

export abstract class BaseRepository<
    TTable extends PgTable & { id: PgColumn },
    TSelect extends { id: string },
    TInsert
> {
    constructor(
        protected readonly db: NodePgDatabase,
        protected readonly table: TTable
    ) {}

    protected async findByCondition(
        condition: SQL | undefined
    ): Promise<TSelect | undefined> {
        const [row] = (await this.db
            .select()
            .from(this.table as PgTable)
            .where(condition)
            .limit(1)) as unknown as TSelect[]
        return row
    }

    protected async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: this.table.id })
            .from(this.table as PgTable)
            .where(condition)
            .limit(1)
        return !!row
    }

    async findById(id: string): Promise<TSelect | undefined> {
        return this.findByCondition(eq(this.table.id, id))
    }

    protected async exactCount(condition?: SQL): Promise<number> {
        const [result] = (await this.db
            .select({ count: sql<number | string>`count(*)` })
            .from(this.table as PgTable)
            .where(condition)) as unknown as { count: number | string }[]
        return Number(result?.count || 0)
    }

    async create(data: TInsert): Promise<TSelect> {
        const [row] = (await this.db
            .insert(this.table)
            .values(data as unknown as TTable['$inferInsert'])
            .returning()) as unknown as TSelect[]
        return row
    }

    async update(
        id: string,
        data: Partial<TInsert>
    ): Promise<TSelect | undefined> {
        const [row] = (await this.db
            .update(this.table)
            .set(data as unknown as Partial<TTable['$inferInsert']>)
            .where(eq(this.table.id, id))
            .returning()) as unknown as TSelect[]
        return row
    }

    async hardDelete(id: string): Promise<TSelect | undefined> {
        const [row] = (await this.db
            .delete(this.table)
            .where(eq(this.table.id, id))
            .returning()) as unknown as TSelect[]
        return row
    }
}
