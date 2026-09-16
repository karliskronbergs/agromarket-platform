-- Lets admins control the display order of categories (e.g. which of the
-- 5 top-level categories shows first) instead of being stuck with
-- alphabetical order.

alter table categories add column sort_order integer not null default 0;

with ranked as (
  select id, row_number() over (partition by parent_id order by name_lv) - 1 as rn
  from categories
)
update categories c
set sort_order = ranked.rn
from ranked
where c.id = ranked.id;

create index categories_parent_sort_idx on categories (parent_id, sort_order);
