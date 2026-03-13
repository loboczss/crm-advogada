import { serverSupabaseUser } from '#supabase/server'
import { getJob } from '../../../../utils/ragJobStore'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user?.sub) throw createError({ statusCode: 401, message: 'Não autorizado.' })

    const jobId = getRouterParam(event, 'jobId')
    if (!jobId) throw createError({ statusCode: 400, message: 'jobId é obrigatório.' })

    const job = getJob(jobId)
    if (!job) throw createError({ statusCode: 404, message: 'Job não encontrado ou expirado.' })

    return job
})
