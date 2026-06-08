import { CreateMidwifeInput } from '@/validations/midwifes-validation'
import { CreateCadreInput } from '@/validations/cadres-validation'
import { CreateParentInput } from '@/validations/parents-validation'

export interface RegisterMultiRolePayload {
    email: string
    password: string
    name: string
    phone_number?: string | null
    avatar_url?: string | null
    role: 'admin' | 'midwife' | 'cadre' | 'parent'
    midwife_data?: Omit<CreateMidwifeInput, 'user_id' | 'status'>
    cadre_data?: Omit<CreateCadreInput, 'user_id' | 'status'>
    parent_data?: Omit<CreateParentInput, 'user_id' | 'status'>
}

export interface AuthenticateCredentialsPayload {
    email: string
    password: string
}

export interface AuthenticationResult {
    session_token: string
    session_expiry: Date
    user_profile: {
        id: string
        email: string
        name: string
        emailVerified: boolean
        image?: string | null
        createdAt: Date
        updatedAt: Date
        role: string
        status: string
    }
}

export interface ResetPasswordPayload {
    new_password: string
    verification_token: string
}
