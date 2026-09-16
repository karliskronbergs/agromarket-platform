-- Replaces the 8 placeholder top-level categories with the full farming
-- taxonomy (127 categories, hierarchical) migrated from the legacy
-- agromarket.lv WordPress site. English names are translations of the
-- original Latvian-only terms; a few specialist plant/breed terms are
-- best-effort (flagged in the PR/commit description) and can be refined
-- later via /admin/categories.
--
-- This is a full replace: existing profile_categories rows are removed
-- (their category ids no longer exist) and any listings.category_id
-- pointing at a removed category is set to null (on delete set null).
-- Acceptable pre-launch, before real profiles/listings exist.

delete from profile_categories;
delete from categories;

alter table categories add column _parent_slug text;

insert into categories (slug, name_lv, name_en, _parent_slug) values
  ('dazadi', 'Dažādi', 'Miscellaneous', null),
  ('majlopi', 'Dzīvnieki', 'Animals', null),
  ('fermu-aprikojums', 'Fermu aprīkojums un iekārtas', 'Farm equipment and machinery', null),
  ('lauksaimnicibas-tehnika', 'Lauksaimniecības Tehnika', 'Agricultural machinery', null),
  ('seklas-un-graudi', 'Sēklas un graudi', 'Seeds & grains', null),

  ('aitas', 'Aitas', 'Sheep', 'majlopi'),
  ('galas-liellopi', 'Gaļas liellopi', 'Beef cattle', 'majlopi'),
  ('piena-liellopi', 'Piena liellopi', 'Dairy cattle', 'majlopi'),

  ('aitu-mates', 'Aitu mātes un jaunaitas', 'Ewes and young sheep', 'aitas'),
  ('jeri', 'Jēri', 'Lambs', 'aitas'),
  ('vaislas-teki', 'Vaislas teķi', 'Breeding rams', 'aitas'),

  ('citi-galas-liellopi', 'Citi gaļas liellopi', 'Other beef cattle', 'galas-liellopi'),
  ('vaislas-bulli', 'Vaislas buļļi', 'Breeding bulls', 'galas-liellopi'),
  ('vaislas-govis-teles', 'Vaislas govis un teles', 'Breeding cows and heifers', 'galas-liellopi'),

  ('piena-bulli', 'Piena šķirnes buļļi', 'Dairy bulls', 'piena-liellopi'),
  ('piena-govis-teles', 'Piena šķirnes govis un teles', 'Dairy cows and heifers', 'piena-liellopi'),

  ('liellopu-audzesana', 'Gaļas liellopu audzēšanas aprīkojums', 'Cattle farming equipment', 'fermu-aprikojums'),
  ('fermu-iekartas', 'Fermu iekārtas', 'Farm equipment', 'fermu-aprikojums'),
  ('aitu-audzesana', 'Aitu audzēšanas aprīkojums', 'Sheep farming equipment', 'fermu-aprikojums'),

  ('barotavas', 'Barotavas', 'Feeders', 'liellopu-audzesana'),
  ('fiksacijas-sprosti', 'Fiksācijas sprosti', 'Cattle head gates', 'liellopu-audzesana'),
  ('cits-novietnes-aprikojums', 'Cits novietnes aprīkojums', 'Other barn equipment', 'liellopu-audzesana'),
  ('norobezojosies-paneli', 'Norobežojošie paneļi', 'Fencing panels', 'liellopu-audzesana'),
  ('svari', 'Svari', 'Scales', 'liellopu-audzesana'),
  ('liellopu-veterinarija', 'Veterinārijas līdzekļi', 'Veterinary supplies (cattle)', 'liellopu-audzesana'),

  ('baribas-izdales-iekartas', 'Barības izdales iekārtas', 'Feed distribution equipment', 'fermu-iekartas'),
  ('baribas-uzglabasana', 'Barības uzglabāšana', 'Feed storage', 'fermu-iekartas'),
  ('cietmeslu-iekartas', 'Cietmēslu iekārtas', 'Solid manure equipment', 'fermu-iekartas'),
  ('cits-novietnu-aprikojums', 'Cits novietņu aprīkojums', 'Other housing equipment', 'fermu-iekartas'),
  ('gulvietu-aprikojums', 'Guļvietu aprīkojums', 'Bedding equipment', 'fermu-iekartas'),
  ('piena-uzglabasana', 'Piena uzglabāšanas iekārtas', 'Milk storage equipment', 'fermu-iekartas'),
  ('skidrmeslu-iekartas', 'Šķidrmēslu iekārtas', 'Liquid manure equipment', 'fermu-iekartas'),
  ('slauksanas-iekartas', 'Slaukšanas iekārtas', 'Milking equipment', 'fermu-iekartas'),
  ('telu-audzesanas-aprikojums', 'Teļu audzēšanas aprīkojums', 'Calf rearing equipment', 'fermu-iekartas'),

  ('aitu-barotavas', 'Aitu barotavas', 'Sheep feeders', 'aitu-audzesana'),
  ('jeru-audzesana', 'Jēru audzēšanas aprīkojums', 'Lamb rearing equipment', 'aitu-audzesana'),
  ('sversanas-fiksacijas-aprikojums', 'Svēršanas un fiksācijas aprīkojums', 'Weighing and restraint equipment', 'aitu-audzesana'),
  ('vilnas-cirpsana', 'Vilnas cirpšana un nagu apstrāde', 'Wool shearing and hoof care', 'aitu-audzesana'),
  ('aitu-veterinarija', 'Veterinārijas līdzekļi', 'Veterinary supplies (sheep)', 'aitu-audzesana'),

  ('augsnes-apstrade', 'Augsnes apstrāde', 'Soil cultivation', 'lauksaimnicibas-tehnika'),
  ('graudu-pirmapstrade', 'Graudu pirmapstrādes tehnika', 'Grain primary processing equipment', 'lauksaimnicibas-tehnika'),
  ('lopbaribas-sagatavosanas-tehnika', 'Lopbarības sagatavošanas tehnika', 'Feed preparation equipment', 'lauksaimnicibas-tehnika'),
  ('meslosanas-un-augu-aizsardziba', 'Mēslošanas un augu aizsardzības tehnika', 'Fertilizing and crop protection equipment', 'lauksaimnicibas-tehnika'),
  ('precizas-tehnologijas', 'Precīzās tehnoloģijas', 'Precision technologies', 'lauksaimnicibas-tehnika'),
  ('razas-novaksana', 'Ražas novākšanas tehnika', 'Harvesting equipment', 'lauksaimnicibas-tehnika'),
  ('sejas-tehnika', 'Sējas un stādāmā tehnika', 'Seeding and planting equipment', 'lauksaimnicibas-tehnika'),
  ('transportesanas-tehnika', 'Kravu transportēšanas tehnika', 'Cargo transport equipment', 'lauksaimnicibas-tehnika'),
  ('traktori', 'Traktori', 'Tractors', 'lauksaimnicibas-tehnika'),

  ('arkli', 'Arkli', 'Plows', 'augsnes-apstrade'),
  ('diski', 'Diski', 'Disc harrows', 'augsnes-apstrade'),
  ('dzilirdinataji', 'Dziļirdinātāji', 'Subsoilers', 'augsnes-apstrade'),
  ('ecesas', 'Ecēšas', 'Harrows', 'augsnes-apstrade'),
  ('frezes', 'Frēzes', 'Rotary tillers', 'augsnes-apstrade'),
  ('kultivatori', 'Kultivatori', 'Cultivators', 'augsnes-apstrade'),
  ('sluces', 'Sļūces', 'Land levelers', 'augsnes-apstrade'),
  ('veltni', 'Veltņi', 'Rollers', 'augsnes-apstrade'),

  ('cita-pirmapstrades-tehnika', 'Cita pirmapstrādes tehnika', 'Other primary processing equipment', 'graudu-pirmapstrade'),
  ('graudu-tiritaji', 'Graudu tīrītāji', 'Grain cleaners', 'graudu-pirmapstrade'),
  ('dzirnavas', 'Graudu dzirnavas', 'Grain mills', 'graudu-pirmapstrade'),
  ('graudu-glabatuves', 'Graudu glabātuves', 'Grain storage', 'graudu-pirmapstrade'),
  ('kaltes', 'Kaltes', 'Grain dryers', 'graudu-pirmapstrade'),

  ('arditaji', 'Ārdītāji', 'Tedders', 'lopbaribas-sagatavosanas-tehnika'),
  ('ietinejs', 'Ietinējs', 'Bale wrapper', 'lopbaribas-sagatavosanas-tehnika'),
  ('kipu-preses', 'Ķīpu preses', 'Balers', 'lopbaribas-sagatavosanas-tehnika'),
  ('plaujmasinas', 'Pļaujmašīnas', 'Mowers', 'lopbaribas-sagatavosanas-tehnika'),
  ('ritulu-preses', 'Rituļu preses', 'Round balers', 'lopbaribas-sagatavosanas-tehnika'),
  ('salmu-izkliedetaji', 'Salmu izkliedētāji', 'Straw spreaders', 'lopbaribas-sagatavosanas-tehnika'),
  ('savacejpiekabes', 'Savācējpiekabes', 'Forage wagons', 'lopbaribas-sagatavosanas-tehnika'),
  ('skabbaribas-blietetajveltnis', 'Skābbarības blietētājveltnis', 'Silage compaction rollers', 'lopbaribas-sagatavosanas-tehnika'),
  ('tunelu-sistemas', 'Skābbarības tuneļu sistēmas', 'Silage tunnel systems', 'lopbaribas-sagatavosanas-tehnika'),
  ('valotaji', 'Vālotāji', 'Rakes (windrowers)', 'lopbaribas-sagatavosanas-tehnika'),
  ('smalcinataji', 'Zaļās masas smalcinātāji', 'Forage choppers', 'lopbaribas-sagatavosanas-tehnika'),

  ('kutsmeslu-izkliedetaji', 'Kūtsmēslu izkliedētāji', 'Manure spreaders', 'meslosanas-un-augu-aizsardziba'),
  ('miglotaji', 'Miglotāji', 'Sprayers', 'meslosanas-un-augu-aizsardziba'),
  ('mineralmeslu-kalka-izkliedetaji', 'Minerālmēslu un kaļķa izkliedētāji', 'Mineral fertilizer and lime spreaders', 'meslosanas-un-augu-aizsardziba'),
  ('skidrmeslu-izkliedetaji', 'Šķidrmēslu izkliedētāji', 'Liquid manure spreaders', 'meslosanas-un-augu-aizsardziba'),

  ('augsnes-paraugu-nonemejs', 'Augsnes paraugu ņēmējs', 'Soil sampler', 'precizas-tehnologijas'),
  ('augu-sensori', 'Augu sensori', 'Plant sensors', 'precizas-tehnologijas'),
  ('droni', 'Droni', 'Drones', 'precizas-tehnologijas'),
  ('gnss-uztvereji', 'GNSS uztvērēji', 'GNSS receivers', 'precizas-tehnologijas'),
  ('gps-uztverejs', 'GPS uztvērējs', 'GPS receiver', 'precizas-tehnologijas'),
  ('mainigas-devas-modula-komplekti', 'Mainīgās devas moduļa komplekti', 'Variable rate module kits', 'precizas-tehnologijas'),
  ('meteostacijas', 'Meteostacijas', 'Weather stations', 'precizas-tehnologijas'),
  ('razas-monitori', 'Ražas monitori', 'Yield monitors', 'precizas-tehnologijas'),

  ('darzenu-kombaini', 'Dārzeņu kombaini', 'Vegetable harvesters', 'razas-novaksana'),
  ('graudu-kombaini', 'Graudu kombaini', 'Grain combines', 'razas-novaksana'),
  ('hederi', 'Kombainu hederi', 'Combine headers', 'razas-novaksana'),
  ('kartupelu-kombaini', 'Kartupeļu kombaini', 'Potato harvesters', 'razas-novaksana'),
  ('ogu-kombaini', 'Ogu kombaini', 'Berry harvesters', 'razas-novaksana'),

  ('darzenu-stadamie', 'Dārzeņu stādāmās mašīnas', 'Vegetable planters', 'sejas-tehnika'),
  ('kartupelu-stadamie', 'Kartupeļu stādamās mašīnas', 'Potato planters', 'sejas-tehnika'),
  ('koku-ogu-stadamie', 'Koku un ogulāju stādāmās mašīnas', 'Tree and berry bush planters', 'sejas-tehnika'),
  ('precizas-sejmasinas', 'Precīzās izsējas sējmašīnas', 'Precision seed drills', 'sejas-tehnika'),
  ('sejmasinas', 'Sējmašīnas', 'Seed drills', 'sejas-tehnika'),
  ('sikseklu-sejmasinas', 'Sīksēklu sējmašīnas', 'Small-seed drills', 'sejas-tehnika'),

  ('cisternas', 'Cisternas', 'Tanker trailers', 'transportesanas-tehnika'),
  ('graudu-parvadasana', 'Graudu pārvadāšanas tehnika', 'Grain transport equipment', 'transportesanas-tehnika'),
  ('lopbaribas-parvadasana', 'Lopbarības pārvadāšanas tehnika', 'Feed transport equipment', 'transportesanas-tehnika'),
  ('piekabes', 'Piekabes', 'Trailers', 'transportesanas-tehnika'),
  ('vilceji', 'Vilcēji', 'Tractor units', 'transportesanas-tehnika'),

  ('graudaugi', 'Graudaugi', 'Cereals (grain crops)', 'seklas-un-graudi'),
  ('krustziezi', 'Krustzieži', 'Brassicas', 'seklas-un-graudi'),
  ('nektaraugi', 'Nektāraugi', 'Nectar plants', 'seklas-un-graudi'),
  ('citas-seklas', 'Pākšaugi, griķi u.c. sēklas', 'Legumes, buckwheat & other seeds', 'seklas-un-graudi'),
  ('zalaju-seklas', 'Zālāju sēklas', 'Forage grass seeds', 'seklas-un-graudi'),
  ('zalmeslojumi', 'Zaļmēslojumi', 'Green manures', 'seklas-un-graudi'),

  ('auzas', 'Auzas', 'Oats', 'graudaugi'),
  ('kviesi', 'Kvieši', 'Wheat', 'graudaugi'),
  ('miezi', 'Mieži', 'Barley', 'graudaugi'),
  ('rudzi', 'Rudzi', 'Rye', 'graudaugi'),
  ('tritikale', 'Tritikāle', 'Triticale', 'graudaugi'),

  ('citi-krustziezi', 'Citi krustzieži', 'Other brassicas', 'krustziezi'),
  ('rapsis', 'Rapsis', 'Rapeseed', 'krustziezi'),
  ('ripsis', 'Ripsis', 'Turnip rape', 'krustziezi'),
  ('rutki', 'Rutki', 'Fodder radish', 'krustziezi'),
  ('sinepes', 'Sinepes', 'Mustard', 'krustziezi'),

  ('amolins', 'Amoliņš', 'Sweet clover (Melilot)', 'nektaraugi'),
  ('austrumu-galega', 'Austrumu galega', 'Eastern galega (goat''s rue)', 'nektaraugi'),
  ('citi-nektaraugi', 'Citi nektāraugi', 'Other nectar plants', 'nektaraugi'),
  ('daglitits', 'Daglītis', 'Bird''s-foot trefoil', 'nektaraugi'),
  ('esparsete', 'Esparsete', 'Sainfoin', 'nektaraugi'),
  ('ezziede', 'Ežziede', 'Sulla (French honeysuckle)', 'nektaraugi'),
  ('facelija', 'Facēlija', 'Phacelia', 'nektaraugi'),
  ('lupinas', 'Lupīnas', 'Lupins', 'nektaraugi'),

  ('stiebrzales', 'Stiebrzāles', 'Grasses', 'zalaju-seklas'),
  ('taurinziezi', 'Tauriņzieži', 'Legumes (Fabaceae)', 'zalaju-seklas'),
  ('zalaju-maisijumi', 'Zālāju maisijumi', 'Grass mixtures', 'zalaju-seklas')
on conflict (slug) do nothing;

update categories c
set parent_id = p.id
from categories p
where p.slug = c._parent_slug;

alter table categories drop column _parent_slug;
