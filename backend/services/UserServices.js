/**
 * User Services Module, contains all the available user-related operations.
 */

/**
 * @typedef {Object} GetResult
 * @property {number} pages - The total number of available pages with the given filters.
 * @property {Object[]} results - The results of the query.
 */

const config = require('../config/index')
const User = require("../models/User");
const makeToken = require("../utils/makeToken");
const Service = require("./Service");
const Channel = require("../models/Channel");
const Plan = require("../models/Plan");
const SquealSocket = require("../socket/Socket");
const { logger } = require("../config/logging");
const dayjs = require("dayjs");

const _ = require('underscore');
const UsersAggregate = require('../utils/UsersAggregate');
const { Socket } = require('socket.io');

class UserService {

    static getSecureUserRecords(filter) {
        return UserService.populateQuery(User.find(filter))
            .select('-__v');
    }

    static getSecureUserRecord(filter) {
        return UserService.populateQuery(User.findOne(filter))
            .select('-__v');
    }

    /**
     * Takes a user query (User.find, .findOne, .findById) and populates all
     * the possible fields.
     * @param {Object} query - The query to populate.
     * @returns The populated query.
     */
    static populateQuery(query) {
        return query
            .populate('smm', 'handle _id')
            .populate('editorChannels', 'name _id')
            .populate('joinedChannels', 'name _id')
            .populate('editorChannelRequests', 'name _id')
            .populate('joinChannelRequests', 'name _id')
            .populate('managed', 'handle _id')
            .populate('subscription.proPlan', '-__v');
    }

    /**
     * Converts mongoose user documents to POJOs.
     * @param {User} user - The user instance.
     * @returns A POJO of the user.
     */
    static makeUserObject(user) {

        let res = user.toObject();

        // if joinedChannels is populated it replaces every channel with its name
        res.joinedChannels = res.joinedChannels?.map(c => c?.name || c);
        res.editorChannels = res.editorChannels?.map(c => c?.name || c);

        res.joinChannelRequests = res.joinChannelRequests?.map(c => c?.name || c);
        res.editorChannelRequests = res.editorChannelRequests?.map(c => c?.name || c);

        res.smm = res.smm?.handle || res.smm;

        if (user.managed) {
            res.managed = user.managed.map(u => u.handle)
        }

        if (user.liked) {
            res.liked = user.liked.map(r => r.message);
        }

        if (user.disliked) {
            res.disliked = user.disliked.map(r => r.message);
        }

        if (user.subscription) {
            res.subscription.proPlan.id = res.subscription.proPlan._id.toString();
        }

        res.id = res._id.toString();

        delete res.__v; delete res.password;

        return res;
    }

    /**
     * Maps makeUserObject to the given array.
     * @param {User[]} userArr - Array of User documents.
     * @returns An array of POJOs created from the array of documents.
     */
    static makeUserObjectArr(userArr) {
        return userArr.map(UserService.makeUserObject)
    }

    /**
     * Read operations for the users resource.
     * @param {Object} param0 - Object created from the request.
     * @param {string} [param0.handle=null] - String to be used as a handle filter.
     * @param {boolean} [param0.admin=null] - Only return admins/non-admins.
     * @param {('pro'|'user'|null)} [param0.accountType=null] - Only return non-pro users/pro users.
     * @param {boolean} param0.handleOnly=false - Return only the user's handles instead of the user documents.
     * @param {number} param0.page=1 - Page number. All users in the database will be returned if the value is <= 0.
     * @param {number} param0.results_per_page=config.results_per_page - String to be used as a handle filter.
     * @param {('created'|'-created'|'popular'|'-popular'|'unpopular'|'-unpopular')} param0.sort=-created - Sort parameter and order (- is desc.).
     * @returns {GetResult} An object containing the query results and the number of available pages.
     * @static
     */
    static async getUsers({ 
        handle=null, 
        admin=null, 
        accountType=null, 
        handleOnly = false, 
        page = 1,
        results_per_page = config.results_per_page, 
        sort='-created',
    } = { page: 1, results_per_page: config.results_per_page }) {

        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        
        let aggr = new UsersAggregate();

        aggr.matchFields({
            handle: handle, admin: admin, accountType: accountType,
        })

        aggr.lookup()
        aggr.sort(sort)
        aggr.countAndSlice(page, results_per_page)

        let res = UsersAggregate.parsePaginatedResults(await aggr.run(), page, results_per_page)

        if (handleOnly) {
            res.results = _.pluck(res.results, 'handle');
        }

        return Service.successResponse(res)
    }

    /**
     * Single user read.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The user's handle.
     * @param {boolean} param0.includeReactions=true - Wether or not to include the user's liked and disliked messages's ids.
     * @returns {GetResult} An object containing the query results and the number of available pages.
     */
    static async getUser({ handle, includeReactions=true }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        let query = UserService.getSecureUserRecord({ handle: handle });

        if (includeReactions) {
            query.populate('liked', 'message');
            query.populate('disliked', 'message');
        }

        let user = await query;

        if (!user) return Service.rejectResponse({ message: "User not found" });

        return Service.successResponse(UserService.makeUserObject(user));        
    }

    /**
     * Creates a new user.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The new user's handle.
     * @param {string} param0.email - The new user's email.
     * @param {string} param0.description - The new user's description.
     * @param {string} param0.password - The new user's password.
     * @param {string} param0.username - The new user's username.
     * @param {string} param0.name - The new user's name.
     * @param {string} param0.lastName - The new user's last name.
     * @param {string} param0.phone - The new user's phone number.
     * @param {string} param0.urlAvata - The new user's url's avatar.
     * @param {('pro'|'user')} param0.accountType - The new user's account type.
     * @param {boolean} param0.blocked=false - Wether the new user is blocked or not.
     * @returns {Object} The new user object.
     */
    static async createUser({ 
        handle, 
        email, 
        description, 
        password,
        username, 
        name, 
        lastName, 
        phone, 
        gender, 
        urlAvatar,
        blocked=false, 
        accountType='user',
    }) {
        
        let creation_error = null;
        
        // Filter out undefined params that don't have a default
        // not sure if needed but oh well
        let extra = Object.entries({
            username, name, lastName, phone, description, gender, urlAvatar,
        }).reduce((a, [k, v]) => {
            if (v !== undefined) {
                a[k] = v;
            }
            return a;
        }, {});

        let new_user = new User({
            handle: handle,
            email: email,
            password: password,
            admin: false,
            accountType: accountType,
            smm: null,
            blocked: blocked,
            ...extra,
        });

        try{
            new_user = await new_user.save();
        } catch (err) {
            creation_error = err;
        }

        if (creation_error) return Service.rejectResponse(creation_error);

        let res_body = {
            handle: new_user.handle,
            id: new_user.id,
            token: makeToken({  
                handle: new_user.handle, 
                accountType: new_user.accountType, 
                admin: false 
            })
        }

        return Service.successResponse(res_body);
    
    }

    /**
     * Deletes one user.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The user's handle.
     * @param {Socket} param0.socket - The server socket.
     * @returns {Object} A success status object.
     */
    static async deleteUser({ handle, socket }) {

        // smm and co fields are kept coherent with the pre('deleteOne') setting, see models/User
        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        const user = await User.findOne({ handle: handle })
            .populate('smm', 'handle')
            .populate('managed', 'handle');

        if ((user.smm) || (user.managed?.length)) {
            SquealSocket.userDeleted({ 
                handle: user.handle,
                smm_handle: user.smm?.handle,
                managed: user.managed,
                socket: socket,
            })
        }

        if (!user) return Service.rejectResponse({ message: `No user named @${handle}` });
        await user.deleteOne();
        
        return Service.successResponse();
    }

    /**
     * Modifies a user.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The new user's handle.
     * @param {string} param0.email - The new user's email.
     * @param {string} param0.description - The new user's description.
     * @param {string} param0.password - The new user's password.
     * @param {string} param0.username - The new user's username.
     * @param {string} param0.name - The new user's name.
     * @param {string} param0.lastName - The new user's last name.
     * @param {string} param0.phone - The new user's phone number.
     * @param {string} param0.urlAvata - The new user's url's avatar.
     * @param {('pro'|'user')} param0.accountType - The new user's account type.
     * @param {boolean} param0.blocked=false - Wether the user is blocked or not.
     * @param {object} param0.charLeft - The new user's characters (must be an object containing day, week and month numerical values).
     * @param {boolean} param0.admin - Wether the user is an admin or not.
     * @param {string[]} param0.addMemberRequest - Names of the channels the user is requesting membership to.
     * @param {string[]} param0.addEditorRequest - Names of the channels the user is requesting to become an editor for.
     * @param {string[]} param0.removeMember - Names of the channels the user is requesting to leave (this will also remove the user from the editor list).
     * @param {string[]} param0.removeEditor - Names of the channels the user is requesting to no longer be an editor for (the user will remain a member).
     * @param {Socket} param0.socket - The server socket.
     * @returns {Object} The new user object.
     */
    static async writeUser({ 
        handle, 
        username,
        email, 
        password, 
        name, 
        lastName, 
        phone, 
        gender, 
        description,  
        blocked, 
        charLeft, 
        addMemberRequest, 
        addEditorRequest, 
        removeMember, 
        removeEditor, 
        admin, 
        socket
    }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        const newVals = {
            email, password, name, lastName,  description,
            phone, gender, username,
        }
        let user = await User.findOne({ handle: handle }).populate('smm', 'handle _id');

        if (!user) return Service.rejectResponse({ 
            message: "User with given handle not found",
         });

        Object.keys(newVals).forEach(k => {
            if (newVals[k])
                user[k] = newVals[k]
        });

        if ((blocked === true) || (blocked === false)) user.blocked = blocked;

        if (charLeft) {
            if (_.isNumber(charLeft.day) && (charLeft.day >= 0)) {
                user.charLeft.day = charLeft.day;
            }
            if (_.isNumber(charLeft.week) && (charLeft.week >= 0)) {
                user.charLeft.week = charLeft.week;
            }
            if (_.isNumber(charLeft.month) && (charLeft.month >= 0)) {
                user.charLeft.month = charLeft.month;
            }
        }

        if (addMemberRequest?.length) {

            let channels = await Channel.find().where('name').in(addMemberRequest);

            // Push the channels that are not already there
            user.joinChannelRequests.addToSet(...channels.map(c => c._id));
        }

        if (addEditorRequest?.length) {

            let channels = await Channel.find().where('name').in(addEditorRequest);

            // Push the channels that are not already there
            user.editorChannelRequests.addToSet(...channels.map(c => c._id));
        }

        if (removeMember?.length) {

            let channels = await Channel.find().where('name').in(removeMember);

            user.joinedChannels = user.joinedChannels.filter(cid =>
                !channels.find(c =>  c._id.equals(cid)));
            user.editorChannels = user.editorChannels.filter(cid =>
                !channels.find(c => c._id.equals(cid)));
        }

        if (removeEditor?.length) {

            let channels = await Channel.find().where('name').in(removeEditor);

            user.editorChannels = user.editorChannels.filter(cid =>
                !channels.find(c => c._id.equals(cid)));
        }

        let smm = null;
        if ((user.accountType === 'user') && (user.smm)) {
            smm = await User.findOne({ _id: user.smm });
            user.smm = null;
        }

        if (_.isBoolean(admin)) {
            user.admin = admin;
        }

        let err = null;

        try {
            user = await user.save()
        } catch(e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        user = await UserService.getSecureUserRecord({ handle: user.handle })

        SquealSocket.userChanged({
            populatedUser: user,
            ebody: UserService.makeUserObject(user),
            socket: socket,
            old_smm_handle: smm?.handle,
        })

        return Service.successResponse(UserService.makeUserObject(user));
    }

    /**
     * Cancels a user's subscription.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The user's handle.
     * @param {Socket} param0.socket - The server socket.
     * @returns {Object} The new user object
     */
    static async deleteSubscription({ handle, socket }) {
        let user = await User.findOne({ handle: handle })
            .populate('smm', 'handle _id');

        if (!user) return Service.rejectResponse({
            message: "User with given handle not found",
        });

        let smm = user.smm?.handle;
        
        user.subscription = null;
        user.accountType = 'user';
        user.smm = null;

        await user.save();

        //user = await UserService.getSecureUserRecord({ handle: handle });

        let managed = await User.find({ smm: user._id });

        await User.updateMany({ smm: user._id }, { smm: null });

        SquealSocket.userChanged({
            populatedUser: user,
            ebody: UserService.makeUserObject(user),
            socket: socket,
            old_smm_handle: smm,
        });

        managed.map(u => {
            u.smm = null;
            SquealSocket.userChanged({
                populatedUser: u,
                ebody: { smm: null },
                socket: socket,
            })
        })

        return Service.successResponse(UserService.makeUserObject(user));
    }

    /**
     * Changes a user's subscription.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The user's handle.
     * @param {string} param0.proPlanName - The name of the user's new pro plan.
     * @param {boolean} param0.autoRenew=true - Wether or not to automatically renew the subscription.
     * @param {Socket} param0.socket - The server socket.
     * @returns {Object} The new user object
     */
    static async changeSubscription({ handle, proPlanName, autoRenew=true, socket }) {
        let user = await User.findOne({ handle: handle })
            .populate('smm', 'handle _id');

        if (!user) return Service.rejectResponse({
            message: "User with given handle not found",
        });

        let old_type = user.accountType;
        let smm = user.smm?.handle;
        user.smm = user.smm?._id;

        let pro_plan = await Plan.findOne({ name: proPlanName });

        if (pro_plan) {

            let expiration_date;

            switch (pro_plan.period) {
                case 'month':
                    expiration_date = (new dayjs()).add(1, 'month').toDate();
                    break;
                case 'year':
                    expiration_date = (new dayjs()).add(1, 'year').toDate();
                    break;
            }

            user.subscription = {
                proPlan: pro_plan._id,
                expires: expiration_date,
                autoRenew: autoRenew,
            }

            if (pro_plan.pro){
                user.accountType = 'pro';
            } else {
                user.accountType = 'user';
                user.smm = null;
            }
        } else {
            return Service.rejectResponse({ message: `No subscription plan named: ${proplanName}` });
        }

        user.charLeft.day += pro_plan.extraCharacters?.day || 0;
        user.charLeft.week += pro_plan.extraCharacters?.week || 0;
        user.charLeft.month += pro_plan.extraCharacters?.month || 0;

        await user.save();

        user = await UserService.getSecureUserRecord({ handle: handle });
        
        if ((user.accountType === 'user') && (old_type === 'pro')) {
            await User.updateMany({ smm: user._id }, { smm: null });
            
            User.find({ smm: user._id }).exec().then(function(users) {
                users.map(u => {
                    u.smm = null;

                    SquealSocket.userChanged({
                        populatedUser: u,
                        ebody: { smm: null },
                        socket: socket,
                    });
                })
            })
        }

        SquealSocket.userChanged({
            populatedUser: user,
            ebody: UserService.makeUserObject(user),
            socket: socket,
            old_smm_handle: smm,
        })

        return Service.successResponse(UserService.makeUserObject(user));

    }

    /**
     * Checks wether the given email and/or handle are available.
     * @param {Object} param0 - Object created from the request.
     * @returns {Object} An object containing a boolean handle and email property.
     */
    static async checkAvailability({ handle=null, email=null }) {
        
        if (!(email || handle)) return Service.rejectResponse({ message: "Must provide either handle or email" })

        let checkEmail, checkHandle;
        let results = new Object();

        if (email) {
            checkEmail = await User.findOne({ email: email });
            results.email = checkEmail ? false: true;
        }
        if (handle) {
            checkHandle = await User.findOne({ handle: handle });
            results.handle = checkHandle ? false : true;
        }
        
        return Service.successResponse(results);
    }
    
    /**
     * Checks wether the given email is available.
     * @param {Object} param0 - Object created from the request.
     * @returns {Object} An object containing a boolean handle and email property.
     */
    static async checkMailValidation({ email=null }) {
        
        if (!email) return Service.rejectResponse({ message: "Must provide email" })

        let checkEmail;
        let results = new Object();

        if (email) {
            checkEmail = await User.findOne({ email: email });
            results.email = checkEmail ? true: false;
        }
        
        return Service.successResponse(results);
    }

    /**
     * Change or remove the user's smm.
     * @param {Object} param0 - Object created from the request.
     * @param {string} param0.handle - The user's handle.
     * @param {('remove'|'change')} param0.operation - Wether to remove or change the smm.
     * @param {string} param0.smm - The new smm's handle. Only used with operation 'change'.
     * @param {Socket} param0.socket - The server socket.
     * @returns {Object} An object containing the operation's result status.
     */
    static async changeSmm({ handle, operation, smm, socket }){

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        // Parameters check

        if ((operation !== 'remove') && (operation !== 'change')) {
            return Service.rejectResponse({ message: `Unknown operation: '${operation}'` });
        }

        if ((operation !== 'remove') && (!smm)) {
            return Service.rejectResponse({ message: "Must provide a valid handle to the smm field if the operation is not 'remove'" });
        } 

        // User Fetching
        let user = await User.findOne({ handle: handle }).populate('smm', 'handle');

        if (!user) return Service.rejectResponse({ message: `User '${handle}' not found` });
        
        let smm_handle = user.smm?.handle;

        // if op was remove we are done
        if (operation === 'remove') {

            user.smm = null;

            await user.save();

            SquealSocket.userChanged({
                populatedUser: user,
                old_smm_handle: smm_handle,
                socket: socket,
                ebody: { smm: null }
            })

            return Service.successResponse();
        }

        // else it was change, fetch new user and set smm
        const new_smm_acc = await User.findOne({ handle: smm });

        if (!new_smm_acc) {
            logger.error(`User '${smm}' not found`)
            return Service.rejectResponse({ message: `User '${smm}' not found` });
        }

        // operation was 'change'
        user.smm = new_smm_acc._id;
        
        let err = null;

        try {
            user = await user.save();
        } catch (e) {
            err = e;
        }

        //logger.error(err)
        if (err) {
            
            return Service.rejectResponse(err);
        }

        user = await User.findOne({ handle: user.handle })
            .populate('smm', 'handle');

        SquealSocket.userChanged({
            populatedUser: user,
            old_smm_handle: smm_handle,
            ebody: { handle: new_smm_acc.handle },
            socket: socket,
        })

        return Service.successResponse()
    }

    /**
    * Change or remove a user's managed users list.
    * @param {Object} param0 - Object created from the request.
    * @param {string} param0.handle - The user's handle.
    * @param {string[]} param0.users - The array of user's hanles to be removed from the user's managed list.
    * @param {Socket} param0.socket - The server socket.
    * @returns {Object} An object containing the operation's result status.
    */
    static async removeManaged({ handle, users, socket }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        let urec = await UserService.getSecureUserRecord({ handle: handle });
        
        let user_records = null;
        if (!users?.length) {
            
            user_records = await User.find()
                .where('smm').equals(urec._id);
        
        } else {
            
            user_records = await User.find()
                .where('handle').in(users)
                .where('smm').equals(urec._id);
        }

        user_records = await Promise.all(user_records.map(u => {
            if (urec._id.equals(u.smm)) {
                u.smm = null;
                return u.save()
            }
        }));

        user_records.map(u => {
            SquealSocket.userChanged({
                populatedUser: u,
                socket: socket,
                ebody: { smm: null }
            })
        });

        urec.managed = []
        SquealSocket.userChanged({
            populatedUser: urec,
            socket: socket,
            ebody: { managed: null }
        })


        return Service.successResponse()
    }

    /**
    * Get the user's manage users list. 
    * @param {Object} param0 - Object created from the request.
    * @param {string} param0.handle - The user's handle.
    * @param {string[]} param0.reqUser - The requesting user object.
    * @returns {Object[]} An object the user's managed users.
    * @deprecated
     */
    static async getManaged({ handle, reqUser }) {

        if (!((handle) && (reqUser))) 
            return Service.rejectResponse({ message: "Must provide a valid handle" })
        
        let user = reqUser;
        if (user.handle !== handle){
            user = await User.findOne({ handle: handle });

            if (!user) return Service.rejectResponse({ message: "Must provide a valid handle" })
        }

        const res = await UserService.populateQuery(User.find({ smm: user._id }));

        return Service.successResponse(UserService.makeUserObjectArr(res));
    }
}

module.exports = UserService;