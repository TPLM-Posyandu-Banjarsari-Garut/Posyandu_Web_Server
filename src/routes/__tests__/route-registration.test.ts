import type { Router } from 'express'
import cadres from '../cadres-route'
import childrens from '../childrens-route'
import consultations from '../consultations-route'
import cron from '../cron-routes'
import educationCategories from '../education-categories-route'
import educations from '../educations-route'
import examinationRecords from '../examination-records-route'
import examinationSchedules from '../examination-schedules-route'
import examinations from '../examinations-route'
import health from '../health-routes'
import immunizationRecords from '../immunization-records-route'
import index from '../index-routes'
import inventories from '../inventories-route'
import kipiDetails from '../kipi-details-route'
import medias from '../medias-route'
import midwifes from '../midwifes-route'
import notifications from '../notifications-route'
import nutritionRecords from '../nutrition-records-route'
import parents from '../parents-route'
import posyandus from '../posyandus-route'
import pregnancyRecords from '../pregnancy-records-route'
import pushSubscriptions from '../push-subscriptions-route'
import trash from '../trash-routes'
import users from '../users-routes'
import vaccines from '../vaccines-route'
import vitaminRecords from '../vitamin-records-route'
import vitamins from '../vitamins-route'

const routeModules: Array<[string, Router]> = [
    ['cadres', cadres],
    ['childrens', childrens],
    ['consultations', consultations],
    ['cron', cron],
    ['education categories', educationCategories],
    ['educations', educations],
    ['examination records', examinationRecords],
    ['examination schedules', examinationSchedules],
    ['examinations', examinations],
    ['health', health],
    ['immunization records', immunizationRecords],
    ['inventories', inventories],
    ['KIPI details', kipiDetails],
    ['media', medias],
    ['midwifes', midwifes],
    ['notifications', notifications],
    ['nutrition records', nutritionRecords],
    ['parents', parents],
    ['posyandus', posyandus],
    ['pregnancy records', pregnancyRecords],
    ['push subscriptions', pushSubscriptions],
    ['trash', trash],
    ['users', users],
    ['vaccines', vaccines],
    ['vitamin records', vitaminRecords],
    ['vitamins', vitamins]
]

describe('route module registration', () => {
    it.each(routeModules)(
        '%s registers at least one route',
        (_name, router) => {
            const layers = (
                router as Router & { stack: Array<{ route?: unknown }> }
            ).stack

            expect(layers.some(layer => layer.route)).toBe(true)
        }
    )

    it('mounts the health endpoint and application API routers', () => {
        const layers = (index as Router & { stack: unknown[] }).stack

        expect(layers.length).toBeGreaterThan(20)
    })
})
