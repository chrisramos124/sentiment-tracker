import {createClient} from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// we are setting up the connection to the supabase database using the createClient function from the supabase-js library. 
// we are exporting the supabase client so that we can use it in other parts of our application.