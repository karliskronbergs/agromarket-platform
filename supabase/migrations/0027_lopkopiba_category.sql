-- Group Dzivnieki (majlopi) and Fermu aprikojums un iekartas under a new
-- top-level Lopkopiba category, and add three new subcategories under
-- it (Baribas, Dravas aprikojums, Cits aprikojums). Existing children of
-- majlopi and fermu-aprikojums are left completely untouched -- only
-- their own parent_id changes.

insert into categories (slug, name_lv, name_en, parent_id, sort_order) values
  ('lopkopiba', 'Lopkopība', 'Livestock farming', null, 0);

update categories
  set parent_id = (select id from categories where slug = 'lopkopiba'), sort_order = 0
  where slug = 'majlopi';

update categories
  set parent_id = (select id from categories where slug = 'lopkopiba'), sort_order = 1
  where slug = 'fermu-aprikojums';

insert into categories (slug, name_lv, name_en, parent_id, sort_order) values
  ('baribas', 'Barība', 'Feed', (select id from categories where slug = 'lopkopiba'), 2),
  ('dravas-aprikojums', 'Dravas aprīkojums', 'Beekeeping equipment', (select id from categories where slug = 'lopkopiba'), 3),
  ('cits-aprikojums', 'Cits aprīkojums', 'Other equipment', (select id from categories where slug = 'lopkopiba'), 4);

update categories set sort_order = 1 where slug = 'lauksaimnicibas-tehnika';
update categories set sort_order = 2 where slug = 'seklas-un-graudi';
update categories set sort_order = 3 where slug = 'mezsaimnieciba';
update categories set sort_order = 4 where slug = 'dazadi';
