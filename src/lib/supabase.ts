import { createClient } from "@/utils/supabase/client";

// Geriye dönük uyumluluk: istemci tarafında tek bir Supabase istemcisi.
export const supabase = createClient();