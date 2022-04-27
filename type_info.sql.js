// credits: https://dba.stackexchange.com/users/6393/gsiems
// src:     https://dba.stackexchange.com/questions/35497/display-user-defined-types-and-their-details
export default `
with types as (
    select
        n.nspname,
        pg_catalog.format_type ( t.oid, null ) as obj_name,
        case
            when t.typrelid != 0 then cast ( 'tuple' as pg_catalog.text )
            when t.typlen < 0 then cast ( 'var' as pg_catalog.text )
        else cast ( t.typlen as pg_catalog.text )
        end as obj_type,
        coalesce ( pg_catalog.obj_description ( t.oid, 'pg_type' ), '' ) as description
    from
        pg_catalog.pg_type t
    join pg_catalog.pg_namespace n
        on n.oid = t.typnamespace
    where
        n.nspname <> 'pg_catalog'
        and n.nspname <> 'information_schema'
        and n.nspname !~ '^pg_toast'
    ),
    cols as (
        select
            n.nspname::text as schema_name,
            pg_catalog.format_type ( t.oid,null ) as obj_name,
            a.attname::text as column_name,
            pg_catalog.format_type ( a.atttypid, a.atttypmod ) as data_type,
            a.attnotnull as is_required,
            a.attnum as ordinal_position,
            pg_catalog.col_description ( a.attrelid,a.attnum ) as description,
            t.oid as obj_oid,
            t.typarray as obj_array_oid,
            a.atttypid as column_oid,
            a.attndims > 0 as column_isarray
        from
            pg_catalog.pg_attribute a
        join pg_catalog.pg_type t
            on  a.attrelid = t.typrelid
        join pg_catalog.pg_namespace n
            on  ( n.oid = t.typnamespace )
        join types
            on  ( types.nspname = n.nspname
                    and types.obj_name = pg_catalog.format_type ( t.oid, null ) )
        where
            a.attnum > 0
            and not a.attisdropped
)
select
    cols.schema_name,
    cols.obj_name,
    cols.column_name,
    cols.data_type,
    cols.ordinal_position,
    cols.is_required,
    cols.obj_oid,
    cols.obj_array_oid,
    cols.column_oid,
    cols.column_isarray
from
    cols
order by
    cols.schema_name,
    cols.obj_name,
    cols.ordinal_position;
`
