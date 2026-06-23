
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jyclxljvekzwunluhapq.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2FxY21hanhrcHVsYWptaWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3NTkyMCwiZXhwIjoyMDg4NzUxOTIwfQ.zIEkBkv8FDK8kZ4hFJTebBvr9720rSidXNb__S9Jp90"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
  console.log('Testing insert into complaints table with jyclxljvekzwunluhapq...')
  
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      title: 'Test Complaint from script',
      description: 'This is a test description from script',
      category: 'Test',
      priority: 'low',
      status: 'pending',
      ai_provider: 'fallback',
      ai_confidence: 1.0
    })
    .select('tracking_id')
    .single()

  if (error) {
    console.error('Insert failed:', JSON.stringify(error, null, 2))
  } else {
    console.log('Insert successful:', data)
  }
}

testInsert()
