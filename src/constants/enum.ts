import { pgEnum } from 'drizzle-orm/pg-core'

export const STATUS_VALUES = ['active', 'inactive'] as const

export const ACCOUNT_STATUS_VALUES = [
    'active',
    'inactive',
    'disabled',
    'pending_verification'
] as const

export const ACCOUNT_ROLE_VALUES = [
    'posyandu_admin',
    'village_admin',
    'parent',
    'cadre',
    'midwife'
] as const

export const GENDER_VALUES = ['male', 'female'] as const

export const FAMILY_RELATION_VALUES = ['father', 'mother', 'guardian'] as const

export const CONSULTATION_STATUS_VALUES = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled'
] as const

export const INVENTORY_CONDITION_VALUES = [
    'good',
    'minor_damage',
    'major_damage',
    'out_of_stock',
    'under_repair'
] as const

export const ADMIN_TYPE_VALUES = [
    'posyandu_admin',
    'village_admin',
    'super_admin'
] as const

export const IMMUNIZATION_STATUS_VALUES = [
    'not_yet',
    'scheduled',
    'completed',
    'missed'
] as const

export const EXAMINATION_TYPE_VALUES = [
    'infant',
    'pregnant_mother',
    'toddler',
    'young_child'
] as const

export const CHILD_CATEGORY_VALUES = [
    'infant',
    'young_child',
    'toddler'
] as const

export const EXAMINATION_STATUS_VALUES = [
    'pending',
    'processing',
    'completed',
    'cancelled'
] as const

export const NOTIFICATION_TYPE_VALUES = [
    'immunization',
    'consultation',
    'examination',
    'education',
    'system'
] as const

export const NOTIFICATION_STATUS_VALUES = ['unread', 'read'] as const

export const PREGNANCY_STATUS_VALUES = [
    'first_trimester',
    'second_trimester',
    'third_trimester',
    'delivered'
] as const

export const AGE_UNIT_VALUES = ['day', 'month', 'year'] as const

export const BLOOD_TYPE_VALUES = ['A', 'B', 'AB', 'O', 'UNKNOWN'] as const

export type Status = (typeof STATUS_VALUES)[number]
export type AccountStatus = (typeof ACCOUNT_STATUS_VALUES)[number]
export type AccountRole = (typeof ACCOUNT_ROLE_VALUES)[number]
export type Gender = (typeof GENDER_VALUES)[number]
export type FamilyRelation = (typeof FAMILY_RELATION_VALUES)[number]
export type ConsultationStatus = (typeof CONSULTATION_STATUS_VALUES)[number]
export type InventoryCondition = (typeof INVENTORY_CONDITION_VALUES)[number]
export type AdminType = (typeof ADMIN_TYPE_VALUES)[number]
export type ImmunizationStatus = (typeof IMMUNIZATION_STATUS_VALUES)[number]
export type ExaminationType = (typeof EXAMINATION_TYPE_VALUES)[number]
export type ChildCategory = (typeof CHILD_CATEGORY_VALUES)[number]
export type ExaminationStatus = (typeof EXAMINATION_STATUS_VALUES)[number]
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number]
export type NotificationStatus = (typeof NOTIFICATION_STATUS_VALUES)[number]
export type PregnancyStatus = (typeof PREGNANCY_STATUS_VALUES)[number]
export type AgeUnit = (typeof AGE_UNIT_VALUES)[number]
export type BloodType = (typeof BLOOD_TYPE_VALUES)[number]

export const statusEnum = pgEnum('status', STATUS_VALUES)
export const accountStatusEnum = pgEnum('account_status', ACCOUNT_STATUS_VALUES)
export const accountRoleEnum = pgEnum('account_role', ACCOUNT_ROLE_VALUES)
export const genderEnum = pgEnum('gender', GENDER_VALUES)

export const familyRelationEnum = pgEnum(
    'family_relation',
    FAMILY_RELATION_VALUES
)

export const consultationStatusEnum = pgEnum(
    'consultation_status',
    CONSULTATION_STATUS_VALUES
)

export const inventoryConditionEnum = pgEnum(
    'inventory_condition',
    INVENTORY_CONDITION_VALUES
)

export const adminTypeEnum = pgEnum('admin_type', ADMIN_TYPE_VALUES)

export const immunizationStatusEnum = pgEnum(
    'immunization_status',
    IMMUNIZATION_STATUS_VALUES
)

export const examinationTypeEnum = pgEnum(
    'examination_type',
    EXAMINATION_TYPE_VALUES
)

export const childCategoryEnum = pgEnum('child_category', CHILD_CATEGORY_VALUES)

export const examinationStatusEnum = pgEnum(
    'examination_status',
    EXAMINATION_STATUS_VALUES
)

export const notificationTypeEnum = pgEnum(
    'notification_type',
    NOTIFICATION_TYPE_VALUES
)

export const notificationStatusEnum = pgEnum(
    'notification_status',
    NOTIFICATION_STATUS_VALUES
)

export const pregnancyStatusEnum = pgEnum(
    'pregnancy_status',
    PREGNANCY_STATUS_VALUES
)

export const bloodTypeEnum = pgEnum('blood_type', BLOOD_TYPE_VALUES)

export const ageUnitEnum = pgEnum('age_unit', AGE_UNIT_VALUES)

/** All pgEnum definitions for Drizzle schema & migrations */
export const pgEnums = {
    status: statusEnum,
    account_status: accountStatusEnum,
    account_role: accountRoleEnum,
    gender: genderEnum,
    family_relation: familyRelationEnum,
    consultation_status: consultationStatusEnum,
    inventory_condition: inventoryConditionEnum,
    admin_type: adminTypeEnum,
    immunization_status: immunizationStatusEnum,
    examination_type: examinationTypeEnum,
    child_category: childCategoryEnum,
    examination_status: examinationStatusEnum,
    notification_type: notificationTypeEnum,
    notification_status: notificationStatusEnum,
    pregnancy_status: pregnancyStatusEnum,
    age_unit: ageUnitEnum,
    blood_type: bloodTypeEnum
} as const

export const toPgEnumSql = (
    name: string,
    values: readonly string[]
): string => {
    const quoted = values.map(v => `'${v}'`).join(', ')
    return `CREATE TYPE "${name}" AS ENUM (${quoted});`
}

export const allPgEnumSql = Object.entries({
    status: STATUS_VALUES,
    account_status: ACCOUNT_STATUS_VALUES,
    account_role: ACCOUNT_ROLE_VALUES,
    gender: GENDER_VALUES,
    family_relation: FAMILY_RELATION_VALUES,
    consultation_status: CONSULTATION_STATUS_VALUES,
    inventory_condition: INVENTORY_CONDITION_VALUES,
    admin_type: ADMIN_TYPE_VALUES,
    immunization_status: IMMUNIZATION_STATUS_VALUES,
    examination_type: EXAMINATION_TYPE_VALUES,
    child_category: CHILD_CATEGORY_VALUES,
    examination_status: EXAMINATION_STATUS_VALUES,
    notification_type: NOTIFICATION_TYPE_VALUES,
    notification_status: NOTIFICATION_STATUS_VALUES,
    pregnancy_status: PREGNANCY_STATUS_VALUES,
    age_unit: AGE_UNIT_VALUES,
    blood_type: BLOOD_TYPE_VALUES
} as const)
    .map(([name, values]) => toPgEnumSql(name, values))
    .join('\n')
