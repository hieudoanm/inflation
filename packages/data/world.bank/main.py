import csv
import json
import re


def to_camel_case(s):
    """Convert string to camelCase"""
    s = re.sub(r"[^0-9a-zA-Z]+", " ", s).title().replace(" ", "")
    return s[0].lower() + s[1:] if s else ""


csv_file = "csv/inflation_data.csv"
json_file = "json/inflation_data.json"

data = {}

with open(csv_file, newline="", encoding="utf-8-sig") as f:  # utf-8-sig removes BOM
    reader = csv.DictReader(f)

    for row in reader:
        # Remove any keys that are empty strings
        row = {k.strip(): v for k, v in row.items() if k.strip() != ""}

        country_name = row.get("Country Name")
        if not country_name:
            continue

        country_code = row.get("Country Code")
        indicator_name = row.get("Indicator Name")
        indicator_code = row.get("Indicator Code")

        # Extract year-data pairs
        year_data = {
            year: (float(row[year]) if row[year] != "" else None)
            for year in row.keys()
            if year.isdigit()
        }

        # Build JSON structure with camelCase keys
        data[country_name] = {
            to_camel_case("Country Name"): country_name,
            to_camel_case("Country Code"): country_code,
            to_camel_case("Indicator Name"): indicator_name,
            to_camel_case("Indicator Code"): indicator_code,
            "data": year_data,
        }

# Save JSON
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"CSV converted to clean JSON: {json_file}")
