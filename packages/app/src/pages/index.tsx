import { NextPage } from 'next';
import { useState } from 'react';
import history from '@inflation/data/history.json';
import countriesCurrencies from '@inflation/data/countries_currencies.json';
import currencies from '@inflation/data/currencies.json';

type Country = {
  countryName: string;
  countryCode: string;
  indicatorName: string;
  indicatorCode: string;
  data: Record<string, number | null>;
};
type InflationResult = {
  adjustedAmount: number;
  cumulativeRate: number;
  averageRate: number;
  health: 'deflation' | 'low' | 'moderate' | 'high';
};
const calculateInflation = (
  data: Record<string, number | null>,
  startYear: number,
  endYear: number,
  amount: number
): InflationResult | null => {
  console.log('Calculating inflation...');
  console.log({ startYear, endYear, amount });

  if (startYear >= endYear) {
    console.warn('Start year is greater than or equal to end year');
    return null;
  }

  let adjusted = amount;
  let cumulativeRate = 0;
  let yearsCount = 0;

  for (let y = startYear; y < endYear; y++) {
    const value = data[y.toString()];
    console.log(`Year ${y}: inflation rate = ${value}`);

    if (value == null) {
      console.warn(`Data missing for year ${y}`);
      return null;
    }

    adjusted *= 1 + value / 100;
    cumulativeRate += value;
    yearsCount++;
    console.log(`Adjusted amount after year ${y}: ${adjusted}`);
  }

  const averageRate = cumulativeRate / yearsCount;
  console.log('Cumulative rate:', cumulativeRate, 'Average rate:', averageRate);

  let health: InflationResult['health'] = 'moderate';
  if (averageRate < 0) health = 'deflation';
  else if (averageRate < 3) health = 'low';
  else if (averageRate < 6) health = 'moderate';
  else health = 'high';

  console.log('Inflation health:', health);

  return {
    adjustedAmount: Number(adjusted.toFixed(2)),
    cumulativeRate: Number(cumulativeRate.toFixed(2)),
    averageRate: Number(averageRate.toFixed(2)),
    health,
  };
};
// Currency → Locale mapping
const currencyLocaleMap: Record<string, string> = {
  USD: 'en-US', // US Dollar
  VND: 'vi-VN', // Vietnamese Dong
  JPY: 'ja-JP', // Japanese Yen
  EUR: 'de-DE', // Euro (Germany)
  GBP: 'en-GB', // British Pound
  AUD: 'en-AU', // Australian Dollar
  CAD: 'en-CA', // Canadian Dollar
  CHF: 'de-CH', // Swiss Franc
  CNY: 'zh-CN', // Chinese Yuan
  SEK: 'sv-SE', // Swedish Krona
  NOK: 'nb-NO', // Norwegian Krone
  DKK: 'da-DK', // Danish Krone
  INR: 'en-IN', // Indian Rupee
  RUB: 'ru-RU', // Russian Ruble
  BRL: 'pt-BR', // Brazilian Real
  MXN: 'es-MX', // Mexican Peso
  ZAR: 'en-ZA', // South African Rand
  SGD: 'en-SG', // Singapore Dollar
  HKD: 'zh-HK', // Hong Kong Dollar
  NZD: 'en-NZ', // New Zealand Dollar
  KRW: 'ko-KR', // South Korean Won
  TRY: 'tr-TR', // Turkish Lira
  ARS: 'es-AR', // Argentine Peso
  PLN: 'pl-PL', // Polish Złoty
  PHP: 'en-PH', // Philippine Peso
  IDR: 'id-ID', // Indonesian Rupiah
  MYR: 'ms-MY', // Malaysian Ringgit
  THB: 'th-TH', // Thai Baht
  ILS: 'he-IL', // Israeli Shekel
  CLP: 'es-CL', // Chilean Peso
  COP: 'es-CO', // Colombian Peso
  SAR: 'ar-SA', // Saudi Riyal
  AED: 'ar-AE', // UAE Dirham
  EGP: 'ar-EG', // Egyptian Pound
  NGN: 'en-NG', // Nigerian Naira
  PKR: 'en-PK', // Pakistani Rupee
  BD: 'bn-BD', // Bangladeshi Taka
  KES: 'en-KE', // Kenyan Shilling
  CZK: 'cs-CZ', // Czech Koruna
  HUF: 'hu-HU', // Hungarian Forint
  RON: 'ro-RO', // Romanian Leu
  BGN: 'bg-BG', // Bulgarian Lev
  HRK: 'hr-HR', // Croatian Kuna
  VEF: 'es-VE', // Venezuelan Bolívar
  UAH: 'uk-UA', // Ukrainian Hryvnia
  LKR: 'si-LK', // Sri Lankan Rupee
};

const HomePage: NextPage = () => {
  // Initial Values
  const countries = Object.values(history) as Country[];
  const defaultSelectedCountry =
    countries.find((c) => c.countryName.toLowerCase() === 'viet nam') || null;
  const defaultCurrency =
    (countriesCurrencies as Record<string, string[]>)[
      defaultSelectedCountry?.countryCode ?? ''
    ]?.at(0) || 'VND';
  const years = Object.keys(defaultSelectedCountry?.data || {}).filter(
    (y) => defaultSelectedCountry?.data[y] !== null
  );
  const defaultSelectedYear = years.length > 0 ? years[0] : '';
  const defaultTargetYear = years.length > 0 ? years[years.length - 1] : '';
  const defaultAmount = 1_000_000;
  const defaultResult = calculateInflation(
    defaultSelectedCountry?.data || {},
    Number(defaultSelectedYear),
    Number(defaultTargetYear),
    defaultAmount
  );

  // State Hooks
  const [
    { selectedCountry, currency, selectedYear, targetYear, amount, result },
    setState,
  ] = useState<{
    selectedCountry: Country | null;
    currency: string;
    selectedYear: string;
    targetYear: string;
    amount: number;
    result: InflationResult | null;
  }>({
    selectedCountry: defaultSelectedCountry,
    currency: defaultCurrency,
    selectedYear: defaultSelectedYear,
    targetYear: defaultTargetYear,
    amount: defaultAmount,
    result: defaultResult,
  });

  const locale = currencyLocaleMap[currency] || 'en-US';

  return (
    <div className="flex min-h-screen flex-col items-center p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">
        💸 Inflation Calculator
      </h1>

      <div className="w-full max-w-lg space-y-6">
        {/* Country Selection Card */}
        <div className="card bg-dark space-y-4 rounded-xl border border-neutral-700 p-6 shadow-2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control w-full">
              <label className="label mb-1">
                <span className="label-text font-semibold">
                  🌍 Select Country
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedCountry?.countryName || ''}
                required
                onChange={(e) => {
                  const country =
                    countries.find((c) => c.countryName === e.target.value) ||
                    null;

                  // Currency
                  const newCurrency =
                    (countriesCurrencies as Record<string, string[]>)[
                      country?.countryCode ?? ''
                    ]?.at(0) || 'USD';

                  // Years
                  const years = Object.keys(country?.data || {}).filter(
                    (y) => country?.data[y] !== null
                  );
                  const newSelectedYear = years.length > 0 ? years[0] : '';
                  const newTargetYear =
                    years.length > 0 ? years[years.length - 1] : '';

                  // Results
                  const result = calculateInflation(
                    country?.data || {},
                    Number(newSelectedYear),
                    Number(newTargetYear),
                    defaultAmount
                  );

                  setState((previous) => ({
                    ...previous,
                    selectedCountry: country,
                    currency: newCurrency,
                    selectedYear: newSelectedYear,
                    targetYear: newTargetYear,
                    result,
                  }));
                }}>
                <option value="" disabled>
                  Select a country
                </option>
                {countries
                  .sort((a: Country, b: Country) =>
                    a.countryName.localeCompare(b.countryName)
                  )
                  .map((c) => (
                    <option key={c.countryCode} value={c.countryName}>
                      {c.countryName}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-control w-full">
              <label className="label mb-1">
                <span className="label-text font-semibold">💰 Currency</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={currency}
                onChange={(e) => {
                  console.log('Currency changed to:', e.target.value);
                  setState((previous) => ({
                    ...previous,
                    currency: e.target.value,
                  }));
                }}>
                {currencies.map((currency: string) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Year & Amount Card */}
        {selectedCountry && (
          <div className="card bg-dark space-y-4 rounded-xl border border-neutral-700 p-6 shadow-2xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-control w-full">
                <label className="label mb-1">
                  <span className="label-text font-semibold">
                    📅 Original Year
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  required
                  value={selectedYear}
                  onChange={(e) => {
                    const newSelectedYear: string = e.target.value;

                    // Reset result
                    const result = calculateInflation(
                      selectedCountry.data,
                      Number(newSelectedYear),
                      Number(targetYear),
                      amount
                    );

                    setState((previous) => ({
                      ...previous,
                      selectedYear: newSelectedYear,
                      result,
                    }));
                  }}>
                  <option value="" disabled>
                    Select year
                  </option>
                  {Object.keys(selectedCountry.data)
                    .filter((y) => selectedCountry.data[y] !== null)
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label mb-1">
                  <span className="label-text font-semibold">
                    📅 Target Year
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  required
                  value={targetYear}
                  onChange={(e) => {
                    const newTargetYear: string = e.target.value;

                    // Reset result
                    const result = calculateInflation(
                      selectedCountry.data,
                      Number(selectedYear),
                      Number(newTargetYear),
                      amount
                    );

                    setState((previous) => ({
                      ...previous,
                      targetYear: newTargetYear,
                      result,
                    }));
                  }}>
                  <option value="" disabled>
                    Select year
                  </option>
                  {Object.keys(selectedCountry.data)
                    .filter((y) => selectedCountry.data[y] !== null)
                    .sort((a, b) => Number(b) - Number(a)) // sort descending
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">💵 Amount</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={amount}
                onChange={(e) => {
                  // Amount
                  const amount = Number(e.target.value);
                  if (amount < 0) return;

                  // Reset result
                  const result = calculateInflation(
                    selectedCountry.data,
                    Number(selectedYear),
                    Number(targetYear),
                    amount
                  );
                  setState((previous) => ({
                    ...previous,
                    amount,
                    result,
                  }));
                }}
              />
            </div>
          </div>
        )}

        {/* Result Table */}
        {result !== null ? (
          <div
            className={`w-full rounded-xl border-2 p-6 ${
              result?.health === 'deflation'
                ? 'border-green-600 bg-green-500 text-white'
                : result?.health === 'low'
                  ? 'border-yellow-500 bg-yellow-400 text-gray-900'
                  : result?.health === 'moderate'
                    ? 'border-orange-500 bg-orange-400 text-white'
                    : 'border-red-600 bg-red-500 text-white'
            }`}>
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
              {result?.health === 'deflation'
                ? '🟢'
                : result?.health === 'low'
                  ? '🟡'
                  : result?.health === 'moderate'
                    ? '🟠'
                    : '🔴'}{' '}
              Inflation Result for {selectedCountry?.countryName}
            </h2>

            <table className="w-full table-auto border-collapse">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold">💵 Original amount</td>
                  <td className="py-1 text-right">
                    {amount.toLocaleString(locale, {
                      style: 'currency',
                      currency,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">➡️ Adjusted amount</td>
                  <td className="py-1 text-right">
                    {result?.adjustedAmount.toLocaleString(locale, {
                      style: 'currency',
                      currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">
                    📊 Cumulative inflation
                  </td>
                  <td className="py-1 text-right">
                    {result?.cumulativeRate.toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">
                    📈 Average annual inflation
                  </td>
                  <td className="py-1 text-right">
                    {result?.averageRate.toLocaleString(locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">🩺 Inflation health</td>
                  <td className="py-1 text-right">
                    <strong>{result?.health}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-4 text-center text-lg font-semibold">
            ⚠️ No data available for <i>{selectedCountry?.countryName}</i> or{' '}
            <i>year range</i>.
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
