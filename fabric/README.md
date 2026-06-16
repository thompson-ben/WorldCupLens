# Fabric notebook — semantic model data-source inventory

`Extract_Semantic_Model_Sources.ipynb` loops through a known list of Power BI /
Fabric semantic models in the Service, reads each model's Power Query (M) code via
the XMLA / TOM endpoint, and identifies **every data source** referenced (SQL,
Web/API, files, SharePoint, cloud storage, SaaS connectors, etc.). **Airtable** and
**Dropbox** are promoted to their own `source_category` — with base/table IDs or
file paths extracted, and a parameterised safety net for when the identifier lives
in a separate parameter — and are also flagged via `keyword_flags`.

## Use

1. Import the `.ipynb` into a Fabric workspace and **attach a default Lakehouse**.
2. Put your model list CSV in that Lakehouse with a **workspace id** and a
   **dataset id** column (GUIDs).
3. Open the **Parameters** cell and set `csv_path`, `workspace_id_col`,
   `dataset_id_col`. Leave `top_n = None` for the full set, or set an int to test.
4. Run all. Results are written as Delta tables:
   - `migration_source_detail` — per-object connector + captured detail + full M code
   - `migration_source_summary` — distinct data sources + which models use each
   - `migration_source_by_category` — rollup of source categories
   - `migration_scan_errors` — models that couldn't be scanned (e.g. no access)

## How sources are detected

The notebook scans the M for any `Namespace.Function(` connector call and maps it
to a friendly category via the curated `DATA_SOURCE_FUNCS` list. Connector-shaped
calls not in the list are captured as `Other (<namespace>)` for review. The first
one or two string arguments (server / database / url / path) are captured as
`source_detail`; the full `m_code` is always retained.

## Requirements

- `semantic-link-labs` (installed by the first cell).
- **XMLA endpoint = Read** enabled on the capacity.
- The notebook identity needs at least **Read/Build** on each semantic model.
