-- Subcategories under Baribas, plus a new price_unit for selling
-- roughage by the bale (rullis) instead of by weight.
alter type price_unit add value if not exists 'bale';

insert into categories (slug, name_lv, name_en, parent_id, sort_order) values
  ('rupja-lopbariba', 'Rupjā lopbarība', 'Roughage', (select id from categories where slug = 'baribas'), 0),
  ('graudi-kombineta-baribas', 'Graudi un kombinētā barība', 'Grains and compound feed', (select id from categories where slug = 'baribas'), 1),
  ('papildbariba', 'Papildbarība', 'Supplementary feed', (select id from categories where slug = 'baribas'), 2);
