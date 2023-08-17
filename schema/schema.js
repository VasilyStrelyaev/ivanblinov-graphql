const graphql = require('graphql');
const users = require('../data/users.json');
const posts = require('../data/posts.json');
const reactions = require('../data/reactions.json');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLList } = graphql;

const reactionsByUser = reactions.reduce((hash, reaction) => {
    const userReactions = hash[reaction.AuthorID];

    if (userReactions)
        userReactions.push(reaction);
    else
        hash[reaction.AuthorID] = [reaction];

    return hash;
}, {});

const postsByUser = posts.reduce((hash, post) => {
    const userPosts = hash[post.AuthorID];

    if (userPosts)
        userPosts.push(post);
    else
        hash[post.AuthorID] = [post];

    return hash;
}, {});

const hashPosts = posts.reduce((hash, post) => {
    hash[post.ID] = post;

    return hash;
}, {});

const UserType = new GraphQLObjectType({
    name: `User`,
    fields: () => ({
        ID: { type: GraphQLID },
        PublicName: { type: GraphQLString },
        Bio: { type: GraphQLString },
        PublicLocation: { type: GraphQLString },
        AvatarURL: { type: GraphQLString },
        Posts: {
            type: new GraphQLList(PostType),
            args: {
                from: { type: GraphQLString },
                to: { type: GraphQLString }
            },
            resolve(parent, args) {
                const userPosts = postsByUser[parent.ID];

                if (!args.from || !args.to)
                    return userPosts;

                return userPosts.filter(post => {
                    const fromMs = new Date(args.from).getTime();
                    const toMs = new Date(args.to).getTime();
                    const postedMs = new Date(post.PostedAt).getTime();

                    return postedMs >= fromMs && postedMs <= toMs;
                });
            }
        },
        Reactions: {
            type: new GraphQLList(ReactionType),
            resolve(parent, args) {
                const reactions = reactionsByUser[parent.ID];

                reactions.forEach(reaction => {
                    reaction.Post = hashPosts[reaction.PostID];
                });

                return reactions;
            }
        }
    })
})

const PostType = new GraphQLObjectType({
    name: `Post`,
    fields: () => ({
        ID: { type: GraphQLID },
        PostedAt: { type: GraphQLString },
        Content: { type: GraphQLString }
    })
})

const ReactionType = new GraphQLObjectType({
    name: `Reaction`,
    fields: () => ({
        ID: { type: GraphQLID },
        Post: { type: PostType },
        LeftAt: { type: GraphQLString },
        ReactionType: { type: GraphQLString }
    })
})

const Query = new GraphQLObjectType({
    name: 'GetAllUsers',
    fields: {
        Users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return users;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Query,
});
