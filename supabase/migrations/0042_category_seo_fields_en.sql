-- 0041_category_seo_fields.sql only seeded Latvian SEO copy (seo_h1,
-- seo_h1_companies, seo_description, meta_title), so the English map page
-- was falling back to those Latvian columns directly -- the English site
-- showed a Latvian heading/title on any category page. Adds English
-- counterparts and seeds the same 5 root categories.
--
-- Also fixes a typo in categories.name_en ("Foresty" -> "Forestry") found
-- while verifying this.

alter table categories add column seo_h1_en text;
alter table categories add column seo_h1_companies_en text;
alter table categories add column seo_description_en text;
alter table categories add column meta_title_en text;

update categories set
  seo_h1_en = 'Livestock farming in Latvia',
  seo_h1_companies_en = 'Livestock farming businesses in Latvia',
  seo_description_en = 'Cattle, sheep, pigs, feed and farm equipment from farms across Latvia.',
  meta_title_en = 'Livestock farming in Latvia | Lauks24.lv'
where slug = 'lopkopiba';

update categories set
  seo_h1_en = 'Agricultural machinery in Latvia',
  seo_h1_companies_en = 'Agricultural machinery businesses in Latvia',
  seo_description_en = 'Tractors, combines and other agricultural machinery for sale and rent from farms across Latvia.',
  meta_title_en = 'Agricultural machinery in Latvia | Lauks24.lv'
where slug = 'lauksaimnicibas-tehnika';

update categories set
  seo_h1_en = 'Seeds and grains in Latvia',
  seo_h1_companies_en = 'Seeds and grains in Latvia',
  seo_description_en = 'Cereals, brassicas, forage and nectar plant seeds from growers across Latvia.',
  meta_title_en = 'Seeds and grains in Latvia | Lauks24.lv'
where slug = 'seklas-un-graudi';

update categories set
  seo_h1_en = 'Forestry in Latvia',
  seo_h1_companies_en = 'Forestry businesses in Latvia',
  seo_description_en = 'Firewood, timber and logging services from businesses across Latvia.',
  meta_title_en = 'Forestry in Latvia | Lauks24.lv',
  name_en = 'Forestry'
where slug = 'mezsaimnieciba';

update categories set
  seo_h1_en = 'Miscellaneous agricultural listings in Latvia',
  seo_h1_companies_en = 'Agricultural businesses in Latvia',
  seo_description_en = 'Honey, services and everything else useful on a farm.',
  meta_title_en = 'Miscellaneous agricultural listings in Latvia | Lauks24.lv'
where slug = 'dazadi';
