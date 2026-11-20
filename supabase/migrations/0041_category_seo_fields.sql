-- design_handoff_v2/FLUID.md "3b. Category heading on the map page (SEO)":
-- each category needs its own SEO fields for the map page's server-rendered
-- <h1>, meta description and <title>. Apply via `supabase db push`, or paste
-- into the Supabase dashboard SQL editor.

alter table categories add column seo_h1 text;
alter table categories add column seo_h1_companies text;
alter table categories add column seo_description text;
alter table categories add column meta_title text;

-- Seed the five root categories with the copy from the Fluid prototype
-- (design_handoff_v2/Lauks24 Fluid.dc.html, the `cats` array). Only root
-- categories get SEO copy -- subcategories are reached via the dropdown,
-- not their own URL, so they don't need it.

update categories set
  seo_h1 = 'Lopkopība Latvijā',
  seo_h1_companies = 'Lopkopības uzņēmumi Latvijā',
  seo_description = 'Liellopi, aitas, cūkas, barība un fermu aprīkojums no saimniecībām visā Latvijā.',
  meta_title = 'Lopkopība Latvijā | Lauks24.lv'
where slug = 'lopkopiba';

update categories set
  seo_h1 = 'Lauksaimniecības tehnika Latvijā',
  seo_h1_companies = 'Lauksaimniecības tehnikas uzņēmumi Latvijā',
  seo_description = 'Traktori, kombaini un cita lauksaimniecības tehnika, ko pārdod un nomā saimniecības visā Latvijā.',
  meta_title = 'Lauksaimniecības tehnika Latvijā | Lauks24.lv'
where slug = 'lauksaimnicibas-tehnika';

update categories set
  seo_h1 = 'Sēklas un graudi Latvijā',
  seo_h1_companies = 'Sēklas un graudi Latvijā',
  seo_description = 'Graudaugi, krustzieži, zālāju un nektāraugu sēklas no audzētājiem visā Latvijā.',
  meta_title = 'Sēklas un graudi Latvijā | Lauks24.lv'
where slug = 'seklas-un-graudi';

update categories set
  seo_h1 = 'Mežsaimniecība Latvijā',
  seo_h1_companies = 'Mežsaimniecības uzņēmumi Latvijā',
  seo_description = 'Malka, kokmateriāli un mežizstrādes pakalpojumi no uzņēmumiem visā Latvijā.',
  meta_title = 'Mežsaimniecība Latvijā | Lauks24.lv'
where slug = 'mezsaimnieciba';

update categories set
  seo_h1 = 'Dažādi lauksaimniecības sludinājumi Latvijā',
  seo_h1_companies = 'Lauksaimniecības uzņēmumi Latvijā',
  seo_description = 'Medus, pakalpojumi un viss cits, kas noder saimniecībā.',
  meta_title = 'Dažādi lauksaimniecības sludinājumi Latvijā | Lauks24.lv'
where slug = 'dazadi';
