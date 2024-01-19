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
const { makeGetResBody } = require('../utils/serviceUtils');

class UserService {

    static getSecureUserRecords(filter) {
        return UserService.populateQuery(User.find(filter))
            .select('-__v');
    }

    static getSecureUserRecord(filter) {
        return UserService.populateQuery(User.findOne(filter))
            .select('-__v');
    }

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

    static makeUserObjectArr(userArr) {
        return userArr.map(UserService.makeUserObject)
    }

    static async getUsers({ handle, admin, accountType, handleOnly = false, page = 1,
        results_per_page = config.results_per_page,
    } = { page: 1, results_per_page: config.results_per_page }) {

        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        let filter = new Object();

        if (handle) filter.handle = { $regex: handle, $options: 'i' };
        if (_.isBoolean(admin)) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        let users;
        if ((_.isBoolean(handleOnly)) && handleOnly) {

            let query = UserService.getSecureUserRecords(filter)
                .sort('meta.created')
                .select('handle');

            if (page > 0)
                query.skip(page * results_per_page).limit(results_per_page);

            users = await query;

            return Service.successResponse(makeGetResBody({
                docs: users,
                page: page,
                results_per_page: results_per_page,
                results_f: r => _.pluck(r, 'handle'),
            }));
        } else {

            let query = UserService.getSecureUserRecords(filter)
                .sort('meta.created');

            if (page > 0)
                query.skip(page * results_per_page).limit(results_per_page);

            users = await query

            return Service.successResponse(makeGetResBody({
                docs: users,
                page: page,
                results_per_page: results_per_page,
                results_f: r => r.map(UserService.makeUserObject)
            }));
        }

    }

    static async getUsersByPopularity({ handle, admin, accountType, handleOnly = false, page = 1,
        results_per_page = config.results_per_page, popularity=null,
    } = { page: 1, results_per_page: config.results_per_page }) {

        let old_rpp = results_per_page;
        results_per_page = parseInt(results_per_page);

        if (_.isNaN(results_per_page)) return Service.rejectResponse({ message: `Invalid results_per_page value: ${old_rpp}` });

        if (results_per_page <= 0) results_per_page = config.results_per_page;

        if (popularity === null) {
            return UserService.getUsers({
                handle, admin, accountType, handleOnly, page,
                results_per_page,
            });
        } else if (!['popular', 'unpopular'].some(p => p === popularity)) {
            return Service.rejectResponse({ message: `Unknown popularity filter: ${popularity}` });
        }

        let filter = new Object();

        if (handle) filter.handle = { $regex: handle, $options: 'i' };
        if (_.isBoolean(admin)) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        let users;

        let aggregation = User.aggregate()
            .match(filter)
            .lookup({
                from: 'messages',
                localField: '_id',
                foreignField: 'author',
                as: 'messages',
            })
            .lookup({
                from: 'users',
                localField: 'smm',
                foreignField: '_id',
                as: 'smm'
            })
            .lookup({
                from: 'channels',
                localField: 'joinedChannels',
                foreignField: '_id',
                as: 'joinedChannels'
            })
            .lookup({
                from: 'channels',
                localField: 'editorChannels',
                foreignField: '_id',
                as: 'editorChannels'
            })
            .lookup({
                from: 'channels',
                localField: 'joinChannelRequests',
                foreignField: '_id',
                as: 'joinChannelRequests'
            })
            .lookup({
                from: 'channels',
                localField: 'editorChannelRequests',
                foreignField: '_id',
                as: 'editorChannelRequests'
            })
            .lookup({
                from: 'users',
                localField: '_id',
                foreignField: 'smm',
                as: 'managed'
            })
            .lookup({
                from: 'plans',
                localField: 'subscription.proPlan',
                foreignField: '_id',
                as: 'proPlan'
            })
            .unwind('messages')
            .group({
                _id: '$_id',
                positive: { $sum: "$messages.reactions.positive" },
                negative: { $sum: "$messages.reactions.negative" },
                doc: { $first: '$$ROOT' }
            })
            .replaceRoot({
                $mergeObjects: ["$$ROOT", '$doc']
            })
            .project({
                messages: 0,
                password: 0,
                doc: 0,
                __v: 0,
            })


        if (popularity === 'popular') {
            aggregation.sort('-positive')
        } else aggregation.sort('-negative');

        if (page > 0) aggregation.skip(page*results_per_page).limit(results_per_page);

        users = await aggregation;

        users = users.map(u => {
            u.smm = u.smm[0]?.handle;
            u.managed = u.managed.map(m => m.handle);
            u.joinedChannels = u.joinedChannels.map(c => c.name);
            u.editorChannels = u.editorChannels.map(c => c.name);
            u.joinChannelRequests = u.joinChannelRequests.map(c => c.name);
            u.editorChannelRequests = u.editorChannelRequests.map(c => c.name);

            if (u.subscription) {
                u.subscription.proPlan = u.proPlan[0];
                delete u.subscription.proPlan.__v;
                u.subscription.proPlan.id = u.subscription.proPlan._id.toString();
            }
            delete u.proPlan;

            u.id = u._id.toString();

            return u;
        });



        return Service.successResponse(makeGetResBody({
            docs: users,
            page: page,
            results_per_page: results_per_page,
        }));
    }

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

    static async createUser({ handle, email, description, password,
            username, name, lastName, phone, gender, urlAvatar,
            blocked=false, accountType='user',
            meta }) {
        
        let creation_error = null;
        
        // Filter out undefined params that don't have a default
        // not sure if needed but oh well
        let extra = Object.entries({
            username, name, lastName, phone, description, gender, urlAvatar, meta,
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

    static async writeUser({ handle, username,
        email, password, name, lastName, 
        phone, gender, description,  blocked, charLeft, addMemberRequest, 
        addEditorRequest, removeMember, removeEditor, admin, socket
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

        // Maybe protects charLeft from getting extra fields but not sure

        if (charLeft) {
            if ((charLeft.day === 0) || (charLeft.day)) {
                user.charLeft.day = charLeft.day;
            }
            if ((charLeft.week === 0) || (charLeft.week)) {
                user.charLeft.week = charLeft.week;
            }
            if ((charLeft.month === 0) || (charLeft.month)) {
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
    
    static async checkMailValidation({ email=null }) {
        
        if (!email) return Service.rejectResponse({ message: "Must provide email" })

        let checkEmail;
        let results = new Object();

        if (email) {
            checkEmail = await User.findOne({ email: email });
            results.email = checkEmail ? true: false;
            results.user=checkEmail
        }
        
        return Service.successResponse(results);
    }

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