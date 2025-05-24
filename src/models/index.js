import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from '../../config.js'

export const supabase = () => {
  return createClient(supabaseUrl, supabaseKey)
}
