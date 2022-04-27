pg-tuple-types
========

Add node-postgres support for:

* composite tuples
* arrays of tuples

## Installing

```
$ yarn add pg-tuple-types
```

## Usage

```js
import pg from 'pg'
import { initTypes } from 'pg-tuple-types'

const { Client } = pg

const sql = new Client()

sql.connect()

;(async () => {
    // load types definitions from DB schema
    await initTypes(pg.types)(sql)

    const customer = await sql.query(`select
            customer._c,
            array_agg(cart)
        from
            (
                select
                customer _c
                from
                customer
                limit 2) customer
        join cart on
            (cart.customer_id = (customer._c).id)
        group by
            customer._c`)

    console.log(JSON.stringify(customer.rows, null, ' '))
})().finally(() => sql.end())
```

## License

Copyright © 2022 [Fabiano Taioli](http://fbn.github.io/);
Released under the MIT license.
