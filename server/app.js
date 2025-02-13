const express = require('express');
const cors  = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('../schema/schema');
const OrdersSchema = require('../schema/orders-schema');

const app = express();
const PORT = 3005;

app.use(cors());

app.use('/graphql', createHandler({
    schema,
}));

app.use('/Orders', createHandler({
    schema: OrdersSchema,
    graphiql: true
}))

app.listen(PORT, err => {
    err ? console.log(err) : console.log('server started!')
})