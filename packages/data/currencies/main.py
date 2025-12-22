import requests
import json
import os

# Fetch the data
url = "https://restcountries.com/v3.1/all?fields=cca3,currencies"
response = requests.get(url)
countries_data = response.json()

# Map country code -> currency codes and collect unique currencies
country_currencies = {}
currencies = set()

for country in countries_data:
    cca3 = country.get("cca3")
    currencies_obj = country.get("currencies", {})
    currency_codes = sorted(list(currencies_obj.keys()))

    if cca3 and currency_codes:
        country_currencies[cca3] = currency_codes
        currencies.update(currency_codes)

# Convert set to sorted list
currencies_list = sorted(list(currencies))

# Ensure json folder exists
os.makedirs("json", exist_ok=True)

# Save country_currencies
with open("json/country_currencies.json", "w", encoding="utf-8") as f:
    json.dump(country_currencies, f, indent=2, ensure_ascii=False)

# Save currencies_list
with open("json/currencies.json", "w", encoding="utf-8") as f:
    json.dump(currencies_list, f, indent=2, ensure_ascii=False)

print("Saved country_currencies.json and currencies.json in the json folder.")
