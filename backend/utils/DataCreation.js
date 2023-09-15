/**
 * Implements a class used to fill the database with dummy data.
 * 
 * @module test/utils/DataCreation
 */


const User = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

const mongoose = require('mongoose')

const dayjs = require('dayjs');
const LoremIpsum = require("lorem-ipsum").LoremIpsum;


/**
 * Each unit test will manipulate its own users/messages/channels. This class
 * instantiates that environment.
 * 
 * @class
 * @public
 */
class TestEnv {
    
    /**
     * Default password that will be used for all users.
     * @type {string}
     * @public
     * @const
     * @default
     */
    static password = '12345678';

    /**
     * Lorem ipsum generator.
     * @type {LoremIpsum}
     * @public
     */
    static lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 4
        },
        wordsPerSentence: {
            max: 20,
            min: 4
        }
    });

    /**
     * Private field used to ensure handles/names uniqueness within the same Testing 
     * Environment.
     * 
     * @type {number}
     * @private
     */
    #env_id;   
    
    /**
    * Prefix added to all handles/channel names
    * 
    * @type {string}
    * @private
    * @constant
    */
    #prefix;

    /**
     * Initializes prefix, users, messages, channels and creates starting users and channels.
     * New users/messages/channels can later be added using addUser/addMessage/addChannel respectively.
     * 
     * @param {string} prefix Unique prefix to add to user handles and channel names
     * @param {number} num_users Number of users to create. addUser with default parameters is used
     * @param {number} num_channels Number of channels to create. addChannels with default parameters is used
     */
    constructor(prefix, num_users=0, num_channels=0, proPlans=[]) {
    
        this.#prefix = prefix;

        /**
         * Array of users belonging to the environment
         * 
         * @type {User[]}
         * @public
         */
        this.users = [];

        /**
         * Array of channels belonging to the environment
         * 
         * @type {Channel[]}
         * @public
         */
        this.channels = [];

        /**
         * Array of messages belonging to the environment
         * 
         * @type {Message[]}
         * @public
         */
        this.messages = [];

        /**
         * Array of available proPlans
         */
        this.proPlans = proPlans;

        this.#env_id = 0;

        for (let i = 0; i < num_users; i++) this.addTestUser()
        for (let i = 0; i < num_channels; i++) this.addRandomChannel()
    }

    /**
     * Creates a new user and adds it to this.users. The user is not saved.
     * 
     * @param {Object} param0 The functions parameters
     * @param {boolean} param0.pro True if the user is a pro user
     * @param {boolean} param0.admin True if the user is an admin user
     * @param {number} param0.day User's daily characters
     * @param {number} param0.week User's weekly characters
     * @param {number} param0.month User's monthly characters
     * @param {number} param0.smmIndex User's smm's index in this.users, -1 if the user has no smm.
     * @param {dayjs} param0.created User's creation date
     * @param {number[]} param0.joinedChannelIndexes Array of indexes in this.channels for the channels the user has joined
     * @param {number} param0.proPlanIndex Index within this.proPlans of the user's pro plan, only needed if the user is pro, \
     *      If the user is pro and no index is provided, one will be choosen at random. 
     * @param {(null|dayjs|Date)} param0.subscriptionExpiration User subscription's expiration date, ony needed if the user is pro.
     *      If the user is pro and no date is provided it will default to now + the plan's period.
     * @param {boolean} param0.autoRenew User subscription's autorenew value, only needed if the user is pro.
     * @returns The user's index in this.users
     * @public
     */
    addTestUser({ pro=false, admin=false, day=1000, week=7000, month=31000, 
            smmIndex=-1, created=null, joinedChannelIndexes=[],
            proPlanIndex=-1, subscriptionExpiration=null, autoRenew=false, }
        = { pro: false, admin: false, day: 1000, week: 7000, month: 31000,
            smmIndex: -1, created: null, joinedChannelIndexes: [],
            proPlanIndex: -1, subscriptionExpiration: null, autoRenew: false }) {


        const handle = `${this.#prefix}-${this.#env_id++}-test_user-${TestEnv.getRandom(0, 4000000000)}`;
        
        const u = new User({
            handle: handle,
            email: `${handle}.test_mail@gmail.com`,
            password: TestEnv.password,
            accountType: pro ? 'pro': 'user',
            admin: admin,
            charLeft: {
                day, week, month,
            },
        })

        if (u.accountType === 'pro') {
            if (proPlanIndex < 0) proPlanIndex = TestEnv.getRandom(0, this.proPlans.length);
            
            if (!subscriptionExpiration) 
                subscriptionExpiration = (new dayjs()).add(1, this.proPlans[proPlanIndex].period);

            u.subscription = {
                proPlan: this.proPlans[proPlanIndex]._id,
                expires: (new dayjs(subscriptionExpiration)).toDate(),
                autoRenew,
            }
            
            if (smmIndex >= 0) u.smm = this.users[smmIndex]._id;
        }

        if (created) u.meta = { created: created.toDate?.() || created };

        if (joinedChannelIndexes?.length) 
            u.joinedChannels = joinedChannelIndexes.map(i => {
                this.channels[i].members.push(u._id);
                return this.channels[i]._id;
            });

        this.users.push(u);

        return this.users.length - 1;
    }

    addUser(user_record) {
        this.users.push(user_record);
        return this.users.length - 1;
    }

    /**
     * Creates a new message and adds it to this.messages, returning its index.
     * The message is not saved.
     * 
     * @param {Object} param0 The function parameters
     * @param {number} param0.authorIndex Index in this.users of the author
     * @param {number[]} param0.destUserIndexes Array of indexes in this.users of the destUsers
     * @param {number[]} param0.destChannelIndexes Array of indexes in this.channel of destChannel
     * @param {number} param0.answeringIndex Index in this.messages of the message being answered, -1 if no message is being answered
     * @param {string} param0.text Message's text content
     * @param {string} param0.imageurl Message's image
     * @param {Object} param0.reactions Message's reaction object
     * @param {number} param0.reactions.positive Message's positive reactions. Must be a non negative int.
     * @param {number} param0.reactions.negative Message's negative reactions. Must be a non negative int.
     * @returns The message's index in this.messages
     * @public
     */
    addMessage({ authorIndex, text, imageurl,  
            destChannelIndexes = [], destUserIndexes = [],
            reactions= { positive: 0, negative: 0 }, meta = null, answeringIndex=-1,
        }) {
        const destUser = destUserIndexes.map(i => this.users[i]._id);
        
        let destChannel = destChannelIndexes.map(i => this.channels[i]);
        // Can only write to joined or public channels
        destChannel = destChannel.filter(c => 
            this.users[authorIndex].joinedChannels.find(joined_id => c._id.equals(joined_id)) ||
            c.publicChannel);

        const author = this.users[authorIndex]._id;

        const m = new Message({
            author, destUser, reactions, 
            content: text ? { text }: { image: imageurl },
            destChannel: destChannel.map(c => c._id)
        })

        if (answeringIndex >= 0) m.answering = this.messages[answeringIndex]._id;

        if (meta) m.meta = meta;

        this.messages.push(m);

        return this.messages.length - 1;
    }


    /**
     * Creates a new channel and adds it to this.channels, returning its index.
     * The channel is not saved.
     * 
     * @param {Object} param0 The function parameters
     * @param {number} param0.membersIndexes Array of indexes in this.users of the members
     * @param {boolean} param0.publicChannel False if the channel is private
     * @param {boolean} param0.official True if the channel is official
     * @param {(dayjs|Date)} param0.created Channe's creation date
     * @returns The channel's index in this.channels
     * @public
     */
    addTestChannel({ creatorIndex, membersIndexes=[], publicChannel=true, official=false, created=null, }) {
        
        const name = `${this.#prefix}-${this.#env_id++}-test_channel-${TestEnv.getRandom(0, 4000000000)}`;

        const c = new Channel({
            creator: this.users[creatorIndex]._id,
            name: name,
            description: TestEnv.lorem.generateParagraphs(1),
            publicChannel, official,
            members: []
        })


        if (created) c.created = (new dayjs(created)).toDate();
        if (membersIndexes.length) c.members = membersIndexes.map(i => {
            this.users[i].joinedChannels.push(c._id);
            return this.users[i]._id;
        })

        if (!c.members.find(id => this.users[creatorIndex]._id.equals(id))) c.members.push(this.users[creatorIndex]._id)

        this.users[creatorIndex].joinedChannels.push(c._id);

        this.channels.push(c);

        return this.channels.length - 1;
    }

    addChannel(channel_record) {
        this.channels.push(channel_record);
        return this.channels.length - 1;
    }

    /**
     * Creates a randomized non official channel and adds it to this.channels. name, description, members
     * creators, date of creation etc are chosen at random.
     * 
     * @param {number} creatorInd The channel's creator index, if lower than 0 the creato is selected at random.
     * @param {number} min_members The minimum number of members.
     */
    addRandomChannel(creatorInd=-1, min_members=1) {
        
        creatorInd = (creatorInd >= 0) ? creatorInd: TestEnv.getRandom(0, this.users.length);
        const creator = this.users[creatorInd];
        const publicChannel = Math.random() > 0.5;

        let membersIndexes = TestEnv.getRandomIndexes(this.users.length, min_members);
        
        if (!membersIndexes.find(ind => ind === creatorInd)) membersIndexes.push(creatorInd);

        // randomic creation date
        const created = TestEnv.getRandomDate(new dayjs(creator.meta.created), new dayjs()).toDate();

        const channel_ind = this.addTestChannel({ creatorIndex: creatorInd,
            membersIndexes, publicChannel, official: false, created, 
        });

        return channel_ind;
    }

    /**
     * Randomly selects ad sets the channel's members. Note that the members field is set,
     * so this should be called on a channel with members = [] or [creator._id]. The creator is
     * always added if it was not added by the randomic selection.
     * 
     * @param {number} channelIndex The channel's index.
     * @param {number} min The minimum number of members to be added.
     */
    addRandomMembers(channelIndex, min) {
        const indexes = TestEnv.getRandomIndexes(this.users.length, min);
        const channel = this.channels[channelIndex];
        const creator_index = this.uidti(channel.creator);
        const creator = this.users[creator_index]

        channel.members = indexes.map(i => {
            this.users[i].joinedChannels.push(channel._id);
            return this.users[i]._id;
        })

        if (!channel.members.find(uid => channel.creator.equals(uid))) channel.members.push(channel.creator);
        if (!creator.joinedChannels.find(cid => channel._id.equals(cid))) creator.joinedChannels.push(channel._id);
        
    }

    /**
     * Adds a Bulk of randomly generated message. Destinations are also choosen at random.
     * The messages are created using this.addMessage, so they will be added to this.messages
     * and should be saved with this.saveAll as usual.
     * 
     * @param {Object} param0 Fucntion Parameters
     * @param {number} parma0.authorIndex The this.users index of the author of all messages in the bulk.
     * @param {number} parma0.allTime Number of messages created in a random date spanning from user creation to now.
     * @param {number} parma0.year Number of messages created in a random date spanning from the start of the year to now.
     * @param {number} parma0.month Number of messages created in a random date spanning from the start of the month to now.
     * @param {number} parma0.week Number of messages created in a random date spanning from the start of the week to now.
     * @param {number} parma0.day Number of messages created in a random date spanning from the start of the day to now.
     * @param {boolean} parma0.answering True if the messages should be responding to another random message.
     * @param {(Function|null)} parma0.reaction_function Function to be used to generate reactions on each message. If not provided, they are generated at random (but will be <= 10)
     */
    addRandomMessages({ authorIndex=-1, 
        allTime = 0, year = 0, month = 0, week = 0, today = 0,
        answering = false, reaction_function = null
    }) {

        let author = (authorIndex >= 0) ? this.users[authorIndex] : this.users[TestEnv.getRandom(0, this.users.length)];

        const possible_channels = this.channels.filter(c => 
            (c.publicChannel || c.members.find(id => author._id.equals(id))));

        const addMiniBulk = (period, amount) => {

            let destUser, destChannel, answered, created;
            
            let author_creation = new dayjs(author.meta.created);
            
            for (let i = 0; i < amount; i++) {
                
                destUser = TestEnv.getRandomIndexes(this.users.length, 0);
                destUser = destUser.filter(i => i !== authorIndex);
                
                destChannel = TestEnv.getRandomIndexes(possible_channels.length, 0);

                answered = (answering) ? 
                    TestEnv.getRandom(0, this.messages.length): -1;

                const text = TestEnv.lorem.generateSentences(TestEnv.getRandom(1, 4));
                
                if (period === 'all time') {
                    const min = author_creation;
                    const max = new dayjs();

                    created = TestEnv.getRandomDate(min, max);
                } else {
                    created = TestEnv.getDateWithinPeriod(period);
                    if (author_creation.isAfter(created)) 
                        created = author_creation.add(5, 'minute');
                }
                
                this.addMessage({
                    authorIndex, text,
                    destUserIndexes: destUser, destChannelIndexes: destChannel,
                    answeringIndex: answered,
                    reactions: reaction_function?.() || 
                        { positive: TestEnv.getRandom(0, 11), negative: TestEnv.getRandom(0, 11) },
                    meta: {
                        created: created.toDate(),
                        lastModified: created.toDate(),
                    }
                })
            }
        }

        addMiniBulk('today', today);
        addMiniBulk('week', week);
        addMiniBulk('month', month);
        addMiniBulk('year', year);
        addMiniBulk('all time', allTime);
    }

    /**
     * Returns an array of references to the messages authored by the given user
     * 
     * @param {number} user_index Index within this.users of the user whose messages are to be returned
     * @returns The array of messages authored by the user
     * @throws Will throw an error if user_index is out of bounds for this.users
     */
    getUserMessages(user_index) {
        const author_id = this.users[user_index]._id;
        return this.messages.filter(m => author_id.equals(m.author));
    }

    getProUsersIndexes() {
        return array.from({ length: this.users.lenght }, (v, i) => i)
            .filter(i => this.users[i].accountType === 'pro');
    }

    /**
     * Saves all users, messages, channels and proPlans to the db.
     * 
     * @public
     * @async
     */
    async saveAll() {
        await Promise.all([...this.users.map(u => u.save()),
                           ...this.channels.map(c => c.save()),
                           ...this.messages.map(m => m.save()),
                           ...this.proPlans.map(p => p.save()),
                        ]);
    }

    /**
     * Message ID To Index. Convert's a message's mongoose id to the this.messages index. 
     * 
     * @param {mongoose.ObjectId} id Message's id
     * @return The message's index in this.messages, -1 if not found.
     * @public
     */
    midti(id) {
        return this.messages.findIndex(m => m._id.equals(id));
    }

    /**
     * User ID To Index. Convert's a user's mongoose id to the this.users index. 
     * 
     * @param {mongoose.ObjectId} id Users's id
     * @return The user's index in this.users, -1 if not found.
     * @public
     */
    uidti(id) {
        return this.users.findIndex(u => u._id.equals(id));
    }

    /**
     * User Handle To Index. Convert's a user's handle to the this.users index. 
     * 
     * @param {string} handle Users's handle
     * @return The user's index in this.users, -1 if not found.
     * @public
     */
    uhti(handle) {
        return this.users.findIndex(u => u.handle === handle);
    }

    /**
     * Channel ID To Index. Convert's a channel's mongoose id to the this.users index. 
     * 
     * @param {mongoose.ObjectId} id Channel's id
     * @return The channel's index in this.channels, -1 if not found.
     * @public
     */
    cidti(id) {
        return this.channels.findIndex(c => c._id.equals(id));
    }

    /**
     * Channel Name To Index. Convert's a channel's name to the this.users index. 
     * 
     * @param {string} name Channel's name
     * @return The channel's index in this.channels, -1 if not found.
     * @public
     */
    cnti(name) {
        return this.channels.findIndex(c => c.name === name);
    }

    /**
     * Generates a random integer between min (included) and max (excluded).
     * 
     * @param {number} min Random value's min, integer
     * @param {number} max Random values's max, integer
     * @returns An integer n, min <= n < max
     * @public
     * @static
     */
    static getRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Genetrates a random dayjs between min (included) ad max (excluded).
     * 
     * @param {(dayjs|Date|number|string)} min Minimum date, will be parsed to new dayjs(min)
     * @param {(dayjs|Date|number|string)} max Maximum date, will be parsed to new dayjs(max)
     * @returns A dayjs date d, min <= d < max.
     * @static
     * @public
     */
    static getRandomDate(min, max = new dayjs()) {

        const dmin = (new dayjs(min)).valueOf();
        const dmax = (new dayjs(max)).valueOf();

        return new dayjs(this.getRandom(dmin, Math.max(dmin, dmax)));
    }

    /**
     * Return a random date within the last day/week/month/year. 
     * 
     * @param {('today'|'day'|'week'|'month'|'year')} period The time period of the random date 
     * @returns A random dayjs date within the given period
     * @static
     */
    static getDateWithinPeriod(period) {

        if (period === 'today') period = 'day';

        if (!['day', 'week', 'month', 'year'].find(p => p === period)) {
            throw Error(`TestData.getDateWithinPeriod unknown time period: ${timeperiod}`);
        }

        let minDate = (new dayjs()).startOf(period);
        let maxDate = (new dayjs()).add(1, 'second');

        let res = TestEnv.getRandomDate(minDate, maxDate)

        return res;
    }

    /**
     * Shuffles in place an array and returns it
     * 
     * @param {Array} array The array to shuffle
     * @returns The shuffled array
     * @static
     * @public
     */
    static shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /**
     * Generates a random permutation of [0, ..., n-1] and returns a random-length slice.
     * Useful to randomly select users/channels/messages
     * 
     * @param {number} n Positive integer, upper bound of the indexes.
     * @param {number} min_length Minimum length of the result
     * @returns a random permutation of [0, ..., n-1] of random length (at least min_length)
     * @public
     * @static
     */
    static getRandomIndexes(n, min_length=1) {

        let random_length = TestEnv.getRandom(min_length, n+1);
        let indexes = Array.from({ length: n }, (v, i) => i);

        indexes = TestEnv.shuffle(indexes);

        return indexes.slice(0, random_length);
    }
}

module.exports = TestEnv