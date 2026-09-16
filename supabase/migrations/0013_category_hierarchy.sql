-- Adds parent/child support to categories so the taxonomy can be a tree
-- (e.g. "Sheep feeders" under "Sheep farming equipment" under "Farm
-- equipment") instead of one flat list.

alter table categories add column parent_id uuid references categories (id) on delete set null;

create index categories_parent_id_idx on categories (parent_id);
