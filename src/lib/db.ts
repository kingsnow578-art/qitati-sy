import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as generatedSupabase } from "@/integrations/supabase/client";

/**
 * The generated Supabase types only cover part of the live schema
 * (favorites, reports, categories, ratings, ... are not included yet).
 * This re-export keeps a working client for those tables until the
 * generated types catch up with the database.
 */
export const supabase = generatedSupabase as unknown as SupabaseClient<any, "public", any>;
