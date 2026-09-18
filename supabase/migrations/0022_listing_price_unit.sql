-- Lets a listing's price be shown per kilogram or per tonne (for grain,
-- seed etc. listings under Sēklas un graudi) instead of always being a
-- flat total price.

create type price_unit as enum ('kg', 't');

alter table listings add column price_unit price_unit;
