import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ListingFilters } from "@/lib/data/types";
import { BASE_PATH } from "@/lib/format";

const field =
  "min-h-11 rounded-md border border-line bg-ink px-3 font-sans text-[15px] font-medium text-sand";
const label = "tracking-caps flex flex-col gap-1.5 font-caps text-xs font-semibold uppercase text-gold";

/** Plain GET form: works without JavaScript and gives shareable URLs. */
export function SearchForm({
  lang,
  dict,
  defaults = {},
}: {
  lang: Locale;
  dict: Dictionary;
  defaults?: ListingFilters;
}) {
  const s = dict.search;
  const purpose = defaults.purpose ?? "sale";

  return (
    <form
      action={`${BASE_PATH}/${lang}/properties${BASE_PATH ? "/" : ""}`}
      method="get"
      aria-label={s.label}
      className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 rounded-xl border border-line bg-panel p-5"
    >
      <fieldset className="flex self-end rounded-lg bg-ink p-1">
        <legend className="sr-only">{s.label}</legend>
        {(["sale", "rent"] as const).map((p) => (
          <label
            key={p}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-sand-2 has-checked:bg-gold has-checked:font-bold has-checked:text-ink"
          >
            <input type="radio" name="purpose" value={p} defaultChecked={purpose === p} className="sr-only" />
            {p === "sale" ? s.buy : s.rent}
          </label>
        ))}
      </fieldset>

      <label className={label}>
        {s.location}
        <input name="q" type="text" defaultValue={defaults.q} placeholder={s.locationPlaceholder} className={field} />
      </label>

      <label className={label}>
        {s.type}
        <select name="type" defaultValue={defaults.type ?? ""} className={field}>
          <option value="">{s.any}</option>
          {Object.entries(s.types).map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
      </label>

      <label className={label}>
        {s.beds}
        <select name="beds" defaultValue={defaults.beds?.toString() ?? ""} className={field}>
          <option value="">{s.any}</option>
          <option value="0">{s.studio}</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </label>

      <label className={label}>
        {s.maxPrice}
        <select name="maxPrice" defaultValue={defaults.maxPrice?.toString() ?? ""} className={field}>
          <option value="">{s.any}</option>
          <option value="150000">AED 150,000</option>
          <option value="1000000">AED 1M</option>
          <option value="2000000">AED 2M</option>
          <option value="5000000">AED 5M</option>
          <option value="10000000">AED 10M</option>
        </select>
      </label>

      <button type="submit" className="min-h-12 self-end rounded-md bg-gold text-[15px] font-bold text-ink hover:bg-gold-light">
        {s.submit}
      </button>
    </form>
  );
}
