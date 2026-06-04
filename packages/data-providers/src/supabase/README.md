# Supabase data provider

`SupabaseDataProvider` implements the same `DataProvider` contract as the
in-memory `StaticDataProvider`, so the app can switch between them with a single
environment flag.

## Setup

1. Create a Supabase project.
2. Run [`schema.sql`](./schema.sql) in the SQL editor.
3. Seed your tables (you can mirror `../static/seed`).
4. Provide the client at the app's server layer and inject it:

```ts
import { createClient } from "@supabase/supabase-js";
import { SupabaseDataProvider } from "@worldcuplens/data-providers";

const client = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
const provider = new SupabaseDataProvider(client);
```

The package declares `@supabase/supabase-js` as an **optional peer dependency**
— it never creates a client or owns credentials, keeping data access decoupled
from configuration.
