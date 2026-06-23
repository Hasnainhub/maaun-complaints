
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vugaqcmajxkpulajmiks.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2FxY21hanhrcHVsYWptaWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NTkyMCwiZXhwIjoyMDg4NzUxOTIwfQ.zIEkBkv8FDK8kZ4hFJTebBvr9720rSidXNb__S9Jp90"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('Checking tables in the database...')
  const { data, error } = await supabase.rpc('get_tables') // This might not exist
  
  if (error) {
    // Try another way - select from a common table
    const { data: deptData, error: deptError } = await supabase.from('departments').select('count')
    if (deptError) {
      console.error('Error fetching departments:', deptError)
    } else {
      console.log('Departments exist. Count result:', deptData)
    }
  } else {
    console.log('Tables:', data)
  }
}

checkTables()
