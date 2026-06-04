import "server-only";

import {
  StaticDataProvider,
  SupabaseDataProvider,
  type DataProvider,
} from "@worldcuplens/data-providers";
import { createServerSupabase } from "./supabase";

let cached: DataProvider | undefined;

/**
 * The app's single source of data. Uses Supabase when configured, otherwise the
 * in-memory seed provider — every page depends only on the {@link DataProvider}
 * interface, so swapping the backend changes nothing else.
 */
export function getDataProvider(): DataProvider {
  if (cached) return cached;
  const supabase = createServerSupabase();
  cached = supabase ? new SupabaseDataProvider(supabase) : new StaticDataProvider();
  return cached;
}
