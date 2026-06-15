const { createClient } = require('@supabase/supabase-js')

const getAdminClient = () => {
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
  return createClient(process.env.SUPABASE_URL, key)
}

async function getActorName(actorId) {
  if (!actorId) return 'Alguém'
  const admin = getAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('name')
    .eq('id', actorId)
    .single()
  return data?.name || 'Alguém'
}

async function createNotification({ recipientId, actorId, type, title, message, link = '/', metadata = {} }) {
  if (!recipientId || recipientId === actorId) return null

  const admin = getAdminClient()
  const actorName = await getActorName(actorId)

  const payload = {
    recipient_id: recipientId,
    actor_id: actorId || null,
    type,
    title,
    message: message || `${actorName} interagiu com você`,
    link,
    metadata,
    read: false,
  }

  const { data, error } = await admin
    .from('notifications')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar notificação:', error.message)
    return null
  }

  return data
}

module.exports = { createNotification, getAdminClient }
