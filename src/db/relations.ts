import { relations } from 'drizzle-orm'

import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { consultations } from '@/db/schemas/consultations-schema'
import { educationCategories } from '@/db/schemas/education-categories-schema'
import { educations } from '@/db/schemas/educations-schema'
import { examinationRecords } from '@/db/schemas/examination-records-schema'
import { examinationSchedules } from '@/db/schemas/examination-schedules-schema'
import { examinations } from '@/db/schemas/examinations-schema'
import { immunizationRecords } from '@/db/schemas/immunization-records'
import { inventories } from '@/db/schemas/inventories-schema'
import { kipiDetails } from '@/db/schemas/kipi-details-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { nutritionRecords } from '@/db/schemas/nutrition-records-schema'
import { parents } from '@/db/schemas/parents-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { pregnancyRecords } from '@/db/schemas/pregnancy-records-schema'
import { relationChildrens } from '@/db/schemas/relation-childrens-schema'
import { users } from '@/db/schemas/users-schema'
import { vaccines } from '@/db/schemas/vaccines-schema'
import { vitaminRecords } from '@/db/schemas/vitamin-records-schema'
import { vitamins } from '@/db/schemas/vitamins-schema'
import { sessions } from '@/db/schemas/sessions-schema'
import { accounts } from '@/db/schemas/accounts-schema'
import { media } from '@/db/schemas/media-schema'

export const usersRelations = relations(users, ({ one, many }) => ({
    parent: one(parents, {
        fields: [users.id],
        references: [parents.user_id]
    }),
    sessions: many(sessions),
    accounts: many(accounts),
    cadreAssignments: many(cadres),
    midwifeAssignments: many(midwifes),
    educations: many(educations),
    media: many(media)
}))

export const sessions_relations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.user_id],
        references: [users.id]
    })
}))

export const accounts_relations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.user_id],
        references: [users.id]
    })
}))

export const parentsRelations = relations(parents, ({ one, many }) => ({
    user: one(users, {
        fields: [parents.user_id],
        references: [users.id]
    }),
    relationChildrens: many(relationChildrens),
    pregnancyRecords: many(pregnancyRecords),
    consultations: many(consultations),
    examinationRecords: many(examinationRecords)
}))

export const cadresRelations = relations(cadres, ({ one, many }) => ({
    user: one(users, {
        fields: [cadres.user_id],
        references: [users.id]
    }),
    posyandu: one(posyandus, {
        fields: [cadres.posyandu_id],
        references: [posyandus.id]
    }),
    immunizationRecords: many(immunizationRecords),
    vitaminRecords: many(vitaminRecords),
    nutritionRecords: many(nutritionRecords),
    consultations: many(consultations),
    examinationRecords: many(examinationRecords)
}))

export const midwifesRelations = relations(midwifes, ({ one, many }) => ({
    user: one(users, {
        fields: [midwifes.user_id],
        references: [users.id]
    }),
    posyandu: one(posyandus, {
        fields: [midwifes.posyandu_id],
        references: [posyandus.id]
    }),
    immunizationRecords: many(immunizationRecords),
    vitaminRecords: many(vitaminRecords),
    nutritionRecords: many(nutritionRecords),
    consultations: many(consultations),
    examinationRecords: many(examinationRecords, {
        relationName: 'midwife'
    }),
    medicalValidations: many(examinationRecords, {
        relationName: 'medicalValidator'
    }),
    managedInventories: many(inventories)
}))

export const posyandusRelations = relations(posyandus, ({ many }) => ({
    cadres: many(cadres),
    midwifes: many(midwifes),
    childrens: many(childrens),
    immunizationRecords: many(immunizationRecords),
    vitaminRecords: many(vitaminRecords),
    examinations: many(examinations),
    examinationSchedules: many(examinationSchedules),
    examinationRecords: many(examinationRecords),
    consultations: many(consultations),
    educations: many(educations),
    inventories: many(inventories),
    pregnancyRecords: many(pregnancyRecords)
}))

export const childrensRelations = relations(childrens, ({ one, many }) => ({
    posyandu: one(posyandus, {
        fields: [childrens.posyandu_id],
        references: [posyandus.id]
    }),
    relationChildrens: many(relationChildrens),
    immunizationRecords: many(immunizationRecords),
    vitaminRecords: many(vitaminRecords),
    nutritionRecords: many(nutritionRecords),
    examinationRecords: many(examinationRecords)
}))

export const relationChildrensRelations = relations(
    relationChildrens,
    ({ one }) => ({
        parent: one(parents, {
            fields: [relationChildrens.parent_id],
            references: [parents.id]
        }),
        children: one(childrens, {
            fields: [relationChildrens.children_id],
            references: [childrens.id]
        })
    })
)

export const vaccinesRelations = relations(vaccines, ({ many }) => ({
    immunizationRecords: many(immunizationRecords)
}))

export const vitaminsRelations = relations(vitamins, ({ many }) => ({
    vitaminRecords: many(vitaminRecords)
}))

export const immunizationRecordsRelations = relations(
    immunizationRecords,
    ({ one }) => ({
        children: one(childrens, {
            fields: [immunizationRecords.children_id],
            references: [childrens.id]
        }),
        vaccine: one(vaccines, {
            fields: [immunizationRecords.vaccine_id],
            references: [vaccines.id]
        }),
        cadre: one(cadres, {
            fields: [immunizationRecords.cadre_id],
            references: [cadres.id]
        }),
        midwife: one(midwifes, {
            fields: [immunizationRecords.midwife_id],
            references: [midwifes.id]
        }),
        posyandu: one(posyandus, {
            fields: [immunizationRecords.posyandu_id],
            references: [posyandus.id]
        }),
        inventory: one(inventories, {
            fields: [immunizationRecords.inventory_id],
            references: [inventories.id]
        }),
        kipiDetail: one(kipiDetails, {
            fields: [immunizationRecords.id],
            references: [kipiDetails.immunization_record_id]
        })
    })
)

export const vitaminRecordsRelations = relations(vitaminRecords, ({ one }) => ({
    children: one(childrens, {
        fields: [vitaminRecords.children_id],
        references: [childrens.id]
    }),
    vitamin: one(vitamins, {
        fields: [vitaminRecords.vitamin_id],
        references: [vitamins.id]
    }),
    cadre: one(cadres, {
        fields: [vitaminRecords.cadre_id],
        references: [cadres.id]
    }),
    midwife: one(midwifes, {
        fields: [vitaminRecords.midwife_id],
        references: [midwifes.id]
    }),
    posyandu: one(posyandus, {
        fields: [vitaminRecords.posyandu_id],
        references: [posyandus.id]
    })
}))

export const nutritionRecordsRelations = relations(
    nutritionRecords,
    ({ one }) => ({
        children: one(childrens, {
            fields: [nutritionRecords.children_id],
            references: [childrens.id]
        }),
        cadre: one(cadres, {
            fields: [nutritionRecords.cadre_id],
            references: [cadres.id]
        }),
        midwife: one(midwifes, {
            fields: [nutritionRecords.midwife_id],
            references: [midwifes.id]
        })
    })
)

export const pregnancyRecordsRelations = relations(
    pregnancyRecords,
    ({ one, many }) => ({
        parent: one(parents, {
            fields: [pregnancyRecords.parent_id],
            references: [parents.id]
        }),
        posyandu: one(posyandus, {
            fields: [pregnancyRecords.posyandu_id],
            references: [posyandus.id]
        }),
        midwife: one(midwifes, {
            fields: [pregnancyRecords.midwife_id],
            references: [midwifes.id]
        }),
        consultations: many(consultations)
    })
)

export const consultationsRelations = relations(consultations, ({ one }) => ({
    parent: one(parents, {
        fields: [consultations.parent_id],
        references: [parents.id]
    }),
    pregnancyRecord: one(pregnancyRecords, {
        fields: [consultations.pregnancy_record_id],
        references: [pregnancyRecords.id]
    }),
    children: one(childrens, {
        fields: [consultations.children_id],
        references: [childrens.id]
    }),
    midwife: one(midwifes, {
        fields: [consultations.midwife_id],
        references: [midwifes.id]
    }),
    cadre: one(cadres, {
        fields: [consultations.cadre_id],
        references: [cadres.id]
    }),
    posyandu: one(posyandus, {
        fields: [consultations.posyandu_id],
        references: [posyandus.id]
    })
}))

export const examinationsRelations = relations(
    examinations,
    ({ one, many }) => ({
        posyandu: one(posyandus, {
            fields: [examinations.posyandu_id],
            references: [posyandus.id]
        }),
        schedules: many(examinationSchedules),
        records: many(examinationRecords)
    })
)

export const examinationSchedulesRelations = relations(
    examinationSchedules,
    ({ one, many }) => ({
        examination: one(examinations, {
            fields: [examinationSchedules.examination_id],
            references: [examinations.id]
        }),
        posyandu: one(posyandus, {
            fields: [examinationSchedules.posyandu_id],
            references: [posyandus.id]
        }),
        midwife: one(midwifes, {
            fields: [examinationSchedules.midwife_id],
            references: [midwifes.id]
        }),
        cadre: one(cadres, {
            fields: [examinationSchedules.cadre_id],
            references: [cadres.id]
        }),
        records: many(examinationRecords)
    })
)

export const examinationRecordsRelations = relations(
    examinationRecords,
    ({ one }) => ({
        examination: one(examinations, {
            fields: [examinationRecords.examination_id],
            references: [examinations.id]
        }),
        schedule: one(examinationSchedules, {
            fields: [examinationRecords.schedule_id],
            references: [examinationSchedules.id]
        }),
        posyandu: one(posyandus, {
            fields: [examinationRecords.posyandu_id],
            references: [posyandus.id]
        }),
        children: one(childrens, {
            fields: [examinationRecords.children_id],
            references: [childrens.id]
        }),
        parent: one(parents, {
            fields: [examinationRecords.parent_id],
            references: [parents.id]
        }),
        cadre: one(cadres, {
            fields: [examinationRecords.cadre_id],
            references: [cadres.id]
        }),
        midwife: one(midwifes, {
            fields: [examinationRecords.midwife_id],
            references: [midwifes.id],
            relationName: 'midwife'
        }),
        medicalValidator: one(midwifes, {
            fields: [examinationRecords.medically_validated_by_midwife_id],
            references: [midwifes.id],
            relationName: 'medicalValidator'
        })
    })
)

export const educationsRelations = relations(educations, ({ one }) => ({
    posyandu: one(posyandus, {
        fields: [educations.posyandu_id],
        references: [posyandus.id]
    }),
    createdBy: one(users, {
        fields: [educations.created_by_user_id],
        references: [users.id]
    }),
    category: one(educationCategories, {
        fields: [educations.category_id],
        references: [educationCategories.id]
    })
}))

export const educationCategoriesRelations = relations(
    educationCategories,
    ({ many }) => ({
        educations: many(educations)
    })
)

export const inventoriesRelations = relations(inventories, ({ one, many }) => ({
    posyandu: one(posyandus, {
        fields: [inventories.posyandu_id],
        references: [posyandus.id]
    }),
    managedByMidwife: one(midwifes, {
        fields: [inventories.managed_by_midwife_id],
        references: [midwifes.id]
    }),
    immunizationRecords: many(immunizationRecords)
}))

export const kipiDetailsRelations = relations(kipiDetails, ({ one }) => ({
    immunizationRecord: one(immunizationRecords, {
        fields: [kipiDetails.immunization_record_id],
        references: [immunizationRecords.id]
    })
}))

export const mediaRelations = relations(media, ({ one }) => ({
    uploader: one(users, {
        fields: [media.uploaded_by],
        references: [users.id]
    })
}))
