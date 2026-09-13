insert into categories (slug, icon, name_lv, name_en) values
  ('grain-crops', 'wheat', 'Graudkopība un laukaugi', 'Grain & crops'),
  ('livestock', 'cow', 'Lopkopība', 'Livestock'),
  ('dairy', 'milk', 'Piensaimniecība', 'Dairy'),
  ('fruits-vegetables', 'apple', 'Augļkopība un dārzeņkopība', 'Fruits & vegetables'),
  ('beekeeping', 'bee', 'Biškopība', 'Beekeeping'),
  ('machinery', 'tractor', 'Lauksaimniecības tehnika', 'Machinery & equipment'),
  ('forestry', 'tree', 'Mežsaimniecība', 'Forestry'),
  ('agri-services', 'handshake', 'Lauksaimniecības pakalpojumi', 'Agricultural services')
on conflict (slug) do nothing;
