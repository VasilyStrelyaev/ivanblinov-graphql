const express = require('express');
const cors  = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('../schema/schema');

const app = express();
const PORT = 3006;

app.use(cors());

app.use('/Users', createHandler({
    schema: schema,
    graphiql: true
}))

app.listen(PORT, err => {
    err ? console.log(err) : console.log('server started!')
})