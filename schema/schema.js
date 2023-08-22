const graphql = require('graphql');
const contacts = require('../data/contacts.json');
const messages = require('../data/messages.json');
const tasks = require('../data/tasks.json');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLInt, GraphQLList } = graphql;

const tasksByUser = tasks.reduce((hash, task) => {
    const contactTasks = hash[task.contactId];

    if (contactTasks)
        contactTasks.push(task);
    else
        hash[task.contactId] = [task];

    return hash;
}, {});

const messagesByUser = messages.reduce((hash, message) => {
    const contactMessages = hash[message.contactId];

    if (contactMessages)
        contactMessages.push(message);
    else
        hash[message.contactId] = [message];

    return hash;
}, {});

const ContactType = new GraphQLObjectType({
    name: `Contact`,
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        position: { type: GraphQLString },
        status: { type: GraphQLString },
        company: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        assignedTo: { type: GraphQLString },
        messages: {
            type: new GraphQLList(MessageType),
            args: {
                from: { type: GraphQLString },
                to: { type: GraphQLString }
            },
            resolve(parent, args) {
                const contactMessages = messagesByUser[parent.id];

                if (!args.from || !args.to)
                    return contactMessages;

                return contactMessages?.filter(message => {
                    const fromMs = new Date(args.from).getTime();
                    const toMs = new Date(args.to).getTime();
                    const createdMs = new Date(message.date).getTime();

                    return createdMs >= fromMs && createdMs <= toMs;
                });
            }
        },
        tasks: {
            type: new GraphQLList(TaskType),
            resolve(parent, args) {
                return tasksByUser[parent.id];
            }
        }
    })
})

const TaskType = new GraphQLObjectType({
    name: `Task`,
    fields: () => ({
        text: { type: GraphQLString },
        date: { type: GraphQLString },
        status: { type: GraphQLString },
        priority: { type: GraphQLString },
        manager: { type: GraphQLString }
    })
})

const MessageType = new GraphQLObjectType({
    name: `Message`,
    fields: () => ({
        text: { type: GraphQLString },
        subject: { type: GraphQLString },
        date: { type: GraphQLString },
        manager: { type: GraphQLString }
    })
})

const Query = new GraphQLObjectType({
    name: 'GetAllContacts',
    fields: {
        Contacts: {
            type: new GraphQLList(ContactType),
            resolve(parent, args) {
                return contacts;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Query,
});
