import * as authValidation from '../auth-validation'
import * as cadresValidation from '../cadres-validation'
import * as childrensValidation from '../childrens-validation'
import * as consultationsValidation from '../consultations-validation'
import * as educationCategoriesValidation from '../education-categories-validation'
import * as educationsValidation from '../educations-validation'
import * as examinationRecordsValidation from '../examination-records-validation'
import * as examinationSchedulesValidation from '../examination-schedules-validation'
import * as examinationsValidation from '../examinations-validation'
import * as immunizationRecordsValidation from '../immunization-records-validation'
import * as inventoriesValidation from '../inventories-validation'
import * as kipiDetailsValidation from '../kipi-details-validation'
import * as mediasValidation from '../medias-validation'
import * as midwifesValidation from '../midwifes-validation'
import * as nutritionRecordsValidation from '../nutrition-records-validation'
import * as parentsValidation from '../parents-validation'
import * as posyandusValidation from '../posyandus-validation'
import * as pregnancyRecordsValidation from '../pregnancy-records-validation'
import * as pushSubscriptionsValidation from '../push-subscriptions-validation'
import * as registrationValidation from '../registration-validation'
import * as sharedValidation from '../shared-validation'
import * as trashValidation from '../trash-validation'
import * as usersValidation from '../users-validation'
import * as vaccinesValidation from '../vaccines-validation'
import * as vitaminRecordsValidation from '../vitamin-records-validation'
import * as vitaminsValidation from '../vitamins-validation'

const validationModules = [
    ['auth', authValidation],
    ['cadres', cadresValidation],
    ['childrens', childrensValidation],
    ['consultations', consultationsValidation],
    ['education categories', educationCategoriesValidation],
    ['educations', educationsValidation],
    ['examination records', examinationRecordsValidation],
    ['examination schedules', examinationSchedulesValidation],
    ['examinations', examinationsValidation],
    ['immunization records', immunizationRecordsValidation],
    ['inventories', inventoriesValidation],
    ['KIPI details', kipiDetailsValidation],
    ['medias', mediasValidation],
    ['midwifes', midwifesValidation],
    ['nutrition records', nutritionRecordsValidation],
    ['parents', parentsValidation],
    ['posyandus', posyandusValidation],
    ['pregnancy records', pregnancyRecordsValidation],
    ['push subscriptions', pushSubscriptionsValidation],
    ['registration', registrationValidation],
    ['shared validation', sharedValidation],
    ['trash', trashValidation],
    ['users', usersValidation],
    ['vaccines', vaccinesValidation],
    ['vitamin records', vitaminRecordsValidation],
    ['vitamins', vitaminsValidation]
] as const

describe('validation modules', () => {
    it.each(validationModules)(
        '%s exports schemas that safely parse empty input',
        (_name, validationModule) => {
            const schemas = Object.entries(validationModule).filter(
                ([name, value]) =>
                    name.endsWith('Schema') &&
                    typeof value === 'object' &&
                    value !== null &&
                    'safeParse' in value
            )

            expect(schemas.length).toBeGreaterThan(0)

            for (const [, schema] of schemas) {
                const result = (
                    schema as { safeParse: (input: unknown) => unknown }
                ).safeParse({})
                expect(result).toHaveProperty('success')
            }
        }
    )

    it('applies pagination defaults and transforms newborn report filters', () => {
        expect(
            childrensValidation.getNewbornReportQuerySchema.parse({})
        ).toMatchObject({ month: expect.any(Number), year: expect.any(Number) })

        expect(
            childrensValidation.getNewbornReportQuerySchema.parse({
                month: '3',
                year: '2025'
            })
        ).toMatchObject({ month: 3, year: 2025 })
    })

    it('rejects invalid role, endpoint, and pagination inputs', () => {
        expect(
            registrationValidation.registerCadreSchema.safeParse({
                email: 'invalid'
            }).success
        ).toBe(false)
        expect(
            pushSubscriptionsValidation.subscribePushSchema.safeParse({
                endpoint: 'not-a-url',
                keys: { p256dh: 'key', auth: 'key' }
            }).success
        ).toBe(false)
        expect(
            usersValidation.getUsersQuerySchema.safeParse({
                role: 'superuser'
            }).success
        ).toBe(false)
        expect(
            usersValidation.getUsersQuerySchema.parse({
                includeDeleted: 'true'
            }).includeDeleted
        ).toBe(true)
    })
})
