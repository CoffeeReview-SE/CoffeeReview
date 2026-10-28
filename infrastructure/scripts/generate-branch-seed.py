import json
import re
from pathlib import Path

DATABASE = Path(__file__).resolve().parents[1] / "Database"
START = "-- BEGIN VERIFIED BRANCH SEED"
END = "-- END VERIFIED BRANCH SEED"


# Generate matching standalone and fresh-install SQL from the sourced branch dataset.
def generate():
    dataset = json.loads((DATABASE / "branches_hcm_verified.json").read_text(encoding="utf-8"))
    branches = dataset["branches"]
    quote = lambda value: "NULL" if value is None else "'" + value.replace("'", "''") + "'"
    brands = sorted({row["brand"] for row in branches})
    assert len(brands) == 10, "All ten seeded brands must have a verified branch"
    addresses = {(row["brand"], " ".join(row["address"].lower().split())) for row in branches}
    assert len(addresses) == len(branches), "Duplicate branch addresses"
    rows = []
    for row in branches:
        assert row["source_url"].startswith("https://")
        assert row["name"] and row["address"]
        rows.append("    (" + ", ".join(quote(row.get(key)) for key in ["brand", "name", "address", "phone"]) + ")")
    sql = f"""{START}
-- Officially published addresses checked {dataset['checked_on']}; sources: branches_hcm_verified.json.
SELECT pg_advisory_xact_lock(824617305);
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM brand WHERE brand_name IN ({', '.join(map(quote, brands))})) <> 10 THEN
        RAISE EXCEPTION 'Seed the ten brands before adding verified branches';
    END IF;
END $$;

WITH verified(brand_name, branch_name, address, phone) AS (
    VALUES
{',\n'.join(rows)}
)
INSERT INTO branch(brand_id, branch_name, address, phone)
SELECT b.brand_id, v.branch_name, v.address, v.phone
FROM verified v JOIN brand b ON b.brand_name = v.brand_name
WHERE NOT EXISTS (
    SELECT 1 FROM branch old
    WHERE old.brand_id = b.brand_id
      AND lower(regexp_replace(trim(old.address), '\\s+', ' ', 'g')) = lower(regexp_replace(trim(v.address), '\\s+', ' ', 'g'))
);
{END}
"""
    (DATABASE / "branches_hcm_verified_seed.sql").write_text("BEGIN;\nSET LOCAL lock_timeout = '5s';\n" + sql + "COMMIT;\n", encoding="utf-8")
    base = DATABASE / "SGCoffeeData.sql"
    schema = base.read_text(encoding="utf-8")
    if START in schema:
        schema = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", lambda _: sql, schema, flags=re.S)
    else:
        schema = schema.replace("COMMIT;", sql + "\nCOMMIT;")
    base.write_text(schema, encoding="utf-8")
    print(f"Generated {len(branches)} branches across {len(brands)} brands")


if __name__ == "__main__":
    generate()
