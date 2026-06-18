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

export const CADRE_POSITION_VALUES = [
    'leader',
    'secretary',
    'treasurer',
    'member'
] as const

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

export const NUTRITION_STATUS_VALUES = [
    'normal',
    'underweight',
    'severely_underweight',
    'stunted',
    'wasted',
    'overweight'
] as const

export const INVENTORY_UNIT_VALUES = [
    'pcs',
    'box',
    'bottle',
    'pack',
    'set'
] as const

export const CAPSULE_COLOR_VALUES = ['blue', 'red'] as const

export const DISTRIBUTION_PERIOD_VALUES = ['february', 'august'] as const

export const SCHEDULE_COMPLIANCE_VALUES = [
    'on_time',
    'late',
    'non_compliant'
] as const

export const SYNC_STATUS_VALUES = ['pending', 'synced', 'failed'] as const

export const SERVICE_LOCATION_TYPE_VALUES = [
    'posyandu',
    'puskesmas',
    'pustu',
    'home',
    'school',
    'paud',
    'kindergarten',
    'daycare'
] as const

export const VITAMIN_RECORD_STATUS_VALUES = [
    'not_yet',
    'given',
    'missed',
    'sweeping'
] as const

export const KIPI_SEVERITY_VALUES = ['mild', 'moderate', 'severe'] as const

export const VACCINE_ROUTE_VALUES = ['injection', 'oral'] as const

export const INVENTORY_ITEM_TYPE_VALUES = [
    'vaccine',
    'vitamin',
    'general'
] as const

export const CONSULTATION_TYPE_VALUES = [
    'pregnancy',
    'child_development',
    'general'
] as const

export const PREGNANCY_RISK_VALUES = ['low', 'moderate', 'high'] as const

export type Status = (typeof STATUS_VALUES)[number]
export type AccountStatus = (typeof ACCOUNT_STATUS_VALUES)[number]
export type AccountRole = (typeof ACCOUNT_ROLE_VALUES)[number]
export type Gender = (typeof GENDER_VALUES)[number]
export type FamilyRelation = (typeof FAMILY_RELATION_VALUES)[number]
export type CadrePosition = (typeof CADRE_POSITION_VALUES)[number]
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
export type NutritionStatus = (typeof NUTRITION_STATUS_VALUES)[number]
export type InventoryUnit = (typeof INVENTORY_UNIT_VALUES)[number]
export type CapsuleColor = (typeof CAPSULE_COLOR_VALUES)[number]
export type DistributionPeriod = (typeof DISTRIBUTION_PERIOD_VALUES)[number]
export type ScheduleCompliance = (typeof SCHEDULE_COMPLIANCE_VALUES)[number]
export type SyncStatus = (typeof SYNC_STATUS_VALUES)[number]
export type ServiceLocationType = (typeof SERVICE_LOCATION_TYPE_VALUES)[number]
export type VitaminRecordStatus = (typeof VITAMIN_RECORD_STATUS_VALUES)[number]
export type KipiSeverity = (typeof KIPI_SEVERITY_VALUES)[number]
export type VaccineRoute = (typeof VACCINE_ROUTE_VALUES)[number]
export type InventoryItemType = (typeof INVENTORY_ITEM_TYPE_VALUES)[number]
export type ConsultationType = (typeof CONSULTATION_TYPE_VALUES)[number]
export type PregnancyRisk = (typeof PREGNANCY_RISK_VALUES)[number]

export const statusEnum = pgEnum('status', STATUS_VALUES)
export const accountStatusEnum = pgEnum('account_status', ACCOUNT_STATUS_VALUES)
export const accountRoleEnum = pgEnum('account_role', ACCOUNT_ROLE_VALUES)
export const genderEnum = pgEnum('gender', GENDER_VALUES)

export const familyRelationEnum = pgEnum(
    'family_relation',
    FAMILY_RELATION_VALUES
)

export const cadrePositionEnum = pgEnum('cadre_position', CADRE_POSITION_VALUES)

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

export const nutritionStatusEnum = pgEnum(
    'nutrition_status',
    NUTRITION_STATUS_VALUES
)

export const inventoryUnitEnum = pgEnum('inventory_unit', INVENTORY_UNIT_VALUES)

export const capsuleColorEnum = pgEnum('capsule_color', CAPSULE_COLOR_VALUES)

export const distributionPeriodEnum = pgEnum(
    'distribution_period',
    DISTRIBUTION_PERIOD_VALUES
)

export const scheduleComplianceEnum = pgEnum(
    'schedule_compliance',
    SCHEDULE_COMPLIANCE_VALUES
)

export const syncStatusEnum = pgEnum('sync_status', SYNC_STATUS_VALUES)

export const serviceLocationTypeEnum = pgEnum(
    'service_location_type',
    SERVICE_LOCATION_TYPE_VALUES
)

export const vitaminRecordStatusEnum = pgEnum(
    'vitamin_record_status',
    VITAMIN_RECORD_STATUS_VALUES
)

export const kipiSeverityEnum = pgEnum('kipi_severity', KIPI_SEVERITY_VALUES)

export const vaccineRouteEnum = pgEnum('vaccine_route', VACCINE_ROUTE_VALUES)

export const inventoryItemTypeEnum = pgEnum(
    'inventory_item_type',
    INVENTORY_ITEM_TYPE_VALUES
)

export const consultationTypeEnum = pgEnum(
    'consultation_type',
    CONSULTATION_TYPE_VALUES
)

export const pregnancyRiskEnum = pgEnum('pregnancy_risk', PREGNANCY_RISK_VALUES)

/** All pgEnum definitions for Drizzle schema & migrations */
export const pgEnums = {
    status: statusEnum,
    account_status: accountStatusEnum,
    account_role: accountRoleEnum,
    gender: genderEnum,
    family_relation: familyRelationEnum,
    cadre_position: cadrePositionEnum,
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
    blood_type: bloodTypeEnum,
    nutrition_status: nutritionStatusEnum,
    inventory_unit: inventoryUnitEnum,
    capsule_color: capsuleColorEnum,
    distribution_period: distributionPeriodEnum,
    schedule_compliance: scheduleComplianceEnum,
    sync_status: syncStatusEnum,
    service_location_type: serviceLocationTypeEnum,
    vitamin_record_status: vitaminRecordStatusEnum,
    kipi_severity: kipiSeverityEnum,
    vaccine_route: vaccineRouteEnum,
    inventory_item_type: inventoryItemTypeEnum,
    consultation_type: consultationTypeEnum,
    pregnancy_risk: pregnancyRiskEnum
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
    cadre_position: CADRE_POSITION_VALUES,
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
    blood_type: BLOOD_TYPE_VALUES,
    nutrition_status: NUTRITION_STATUS_VALUES,
    inventory_unit: INVENTORY_UNIT_VALUES,
    capsule_color: CAPSULE_COLOR_VALUES,
    distribution_period: DISTRIBUTION_PERIOD_VALUES,
    schedule_compliance: SCHEDULE_COMPLIANCE_VALUES,
    sync_status: SYNC_STATUS_VALUES,
    service_location_type: SERVICE_LOCATION_TYPE_VALUES,
    vitamin_record_status: VITAMIN_RECORD_STATUS_VALUES,
    kipi_severity: KIPI_SEVERITY_VALUES,
    vaccine_route: VACCINE_ROUTE_VALUES,
    inventory_item_type: INVENTORY_ITEM_TYPE_VALUES,
    consultation_type: CONSULTATION_TYPE_VALUES,
    pregnancy_risk: PREGNANCY_RISK_VALUES
} as const)
    .map(([name, values]) => toPgEnumSql(name, values))
    .join('\n')
