# Fabric notebook — Airtable / Dropbox source extraction

`Extract_Airtable_Dropbox_Sources.ipynb` loops through a known list of Power BI /
Fabric semantic models in the Service, reads each model's Power Query (M) code via
the XMLA / TOM endpoint, and extracts every **Airtable** and **Dropbox** source
definition for a migration inventory.

## Use

1. Import the `.ipynb` into a Fabric workspace and **attach a default Lakehouse**.
2. Put your model list CSV in that Lakehouse (default expected path
   `Files/migration/models.csv`) with a **workspace id** and **dataset id** column
   (GUIDs).
3. Open the **Parameters** cell and set `csv_path`, `workspace_id_col`,
   `dataset_id_col`. Leave `top_n = 5` to test on a few models; set `top_n = None`
   to run the full set.
4. Run all. Results are written as Delta tables:
   - `migration_source_detail` — per-object matched values + full M code
   - `migration_source_summary` — distinct ultimate datasources + which models use them
   - `migration_scan_errors` — models that couldn't be scanned (e.g. no access)

## Requirements

- `semantic-link-labs` (installed by the first cell).
- **XMLA endpoint = Read** enabled on the capacity.
- The notebook identity needs at least **Read/Build** on each semantic model.
