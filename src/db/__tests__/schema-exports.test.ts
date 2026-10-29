import * as schema from '@/db'

describe('database schema exports', () => {
    it('exports the tables used by the application', () => {
        expect(schema.users).toBeDefined()
        expect(schema.parents).toBeDefined()
        expect(schema.childrens).toBeDefined()
        expect(schema.posyandus).toBeDefined()
        expect(schema.consultations).toBeDefined()
        expect(schema.vaccines).toBeDefined()
        expect(schema.vitamins).toBeDefined()
        expect(schema.examinationRecords).toBeDefined()
    })

    it('exports relations for user-owned records', () => {
        expect(schema.relationChildrens).toBeDefined()
        expect(schema.parentsRelations).toBeDefined()
        expect(schema.cadresRelations).toBeDefined()
        expect(schema.midwifesRelations).toBeDefined()
    })
})
