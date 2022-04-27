import TYPE_INFO_SQL from './type_info.sql.js'
import { prop, groupWith, pipe, forEach, map, addIndex } from 'ramda'
import { parse } from 'postgres-composite'
import { parse as arrayParser } from 'postgres-array'

const imap = addIndex(map)

const getTypes = async sql =>
    pipe(
        prop('rows'),
        groupWith((a, b) => a.obj_oid === b.obj_oid)
    )(await sql.query(TYPE_INFO_SQL))

const tuple = types => type =>
    pipe(
        txt => [...parse(txt)],
        imap((value, idx) => [
            type[idx].column_name,
            value && types.getTypeParser(type[idx].column_oid)(value)
        ]),
        Object.fromEntries
    )

const tupleOrArray = types => type => {
    types.setTypeParser(type[0].obj_oid, tuple(types)(type))
    types.setTypeParser(type[0].obj_array_oid, v =>
        arrayParser(v, tuple(types)(type))
    )
}

const initTypes = types => async sql =>
    forEach(tupleOrArray(types), await getTypes(sql))

export { initTypes }
