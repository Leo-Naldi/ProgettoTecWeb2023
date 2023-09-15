const { default: mongoose } = require("mongoose");

const config = require('../config/index')
const User = require("../models/User");
const makeToken = require("../utils/makeToken");
const Service = require("./Service");
const Channel = require("../models/Channel");
const Plan = require("../models/Plan");

class UserService {



    static #getSecureUserRecords(filter) {
        return UserService.#populateQuery(User.find(filter))
            .select('-__v -password');
    }

    static #getSecureUserRecord(filter) {
        return UserService.#populateQuery(User.findOne(filter))
            .select('-__v -password');
    }

    static #populateQuery(query) {
        return query.populate('joinedChannels', 'name')
            .populate('smm', 'handle')
            // .populate('messages', '_id')
            .populate('editorChannels', 'name')
            .populate('managed', 'handle');
    }

    static #makeUserObject(user) {

        let res = user.toObject();

        // if joinedChannels is populated it replaces every channel with its name
        res.joinedChannels = res.joinedChannels?.map(c => c?.name || c);
        res.editorChannels = res.editorChannels?.map(c => c?.name || c);

        res.smm = res.smm?.handle || res.smm;

        if (user.messages) {
            res.messages = user.messages.map(m => m._id?.toString() || m);
        }

        if (user.managed) {
            res.managed = user.managed.map(u => '@' + (u.handle || u))
        }

        return res;
    }

    static #makeUserObjectArr(userArr) {
        return userArr.map(UserService.#makeUserObject)
    }

    static async getUsers({ handle, admin, accountType, handleOnly, page = 1 } = { page: 1}){
        let filter = new Object();

        if (handle) filter.handle = handle;
        if ((admin === true) || (admin === false)) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        let users;
        if ((handleOnly === true) || (handleOnly === false)) {
            users = await UserService.#getSecureUserRecords(filter)
                .sort('meta.created')
                .select('handle');
            
            return Service.successResponse(UserService.#makeUserObjectArr(users));
        } else {
            users = await UserService.#getSecureUserRecords(filter)
                .sort('meta.created')
                .skip((page - 1) * config.results_per_page)
                .limit(config.results_per_page);

                return Service.successResponse(UserService.#makeUserObjectArr(users));
        }

    }

    static async getUser({ handle }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        let user = await UserService.#getSecureUserRecord({ handle: handle });

        if (!user) return Service.rejectResponse({ message: "User not found" });

        return Service.successResponse(UserService.#makeUserObject(user));        
    }

    static async createUser({ handle, email, password,
            username, name, lastName, phone, gender, urlAvatar,
            blocked=false, accountType='user',
            meta }) {
        
        let creation_error = null;
        
        // Filter out undefined params that don't have a default
        // not sure if needed but oh well
        let extra = Object.entries({
            username, name, lastName, phone, gender, urlAvatar, meta,
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

    static async deleteUser({ handle }) {

        // smm and co fields are kept coherent with the pre('deleteOne') setting, see models/User
        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        const user = await User.findOne({ handle: handle });

        if (!user) return Service.rejectResponse({ message: `No user named @${handle}` });
        await user.deleteOne();
        
        return Service.successResponse();
    }

    static async writeUser({ handle, username,
        email, password, name, lastName, 
        phone, gender, blocked,
        accountType, charLeft, addMemberRequest, 
        addEditorRequest, removeMember, removeEditor,
    }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        const newVals = {
            email, password, name, lastName, 
            phone, gender, username,
            accountType,
        }
        let user = await User.findOne({ handle: handle });

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

            await Promise.all(channels.map(c => {
                if (!user.joinedChannels.find(cid => c._id.equals(cid))) {
                    c.memberRequests.push(user._id);
                

                    return c.save();
                }
            }));

            // Push the channels that are not already there
            user.joinChannelRequests.push(...channels
                .filter(c => 
                    !user.joinChannelRequests.find(cid => c._id.equals(cid)))
                .map(c => c._id));
        }

        if (addEditorRequest?.length) {

            let channels = await Channel.find().where('name').in(addEditorRequest);

            await Promise.all(channels.map(c => {
                if (!user.editorChannels.find(cid => c._id.equals(cid))) {
                    c.editorRequests.push(user._id);

                    return c.save();
                }
            }));

            user.editorChannelRequests.push(...channels
                .filter(c =>
                    !user.joinChannelRequests.find(cid => c._id.equals(cid)))
                .map(c => c._id));
        }

        if (removeMember?.length) {

            let channels = await Channel.find().where('name').in(addEditorRequest);

            await Promise.all(channels.map(c => {
                
                if (user.joinedChannels.find(cid => c._id.equals(cid))) {
                    
                    c.members = c.members.filter(uid => !user._id.equals(uid));
                    c.editors = c.editors.filter(uid => !user._id.equals(uid));

                    return crec.save();
                }
            }));

            user.joinedChannels = user.joinedChannels.filter(cid =>
                !channels.find(c =>  c._id.equals(cid)));
        }

        if (removeEditor?.length) {

            let channels = await Channel.find().where('name').in(addEditorRequest);

            await Promise.all(channels.map(c => {

                if (user.joinedChannels.find(cid => c._id.equals(cid))) {

                    c.editors = c.editors.filter(uid => !user._id.equals(uid));

                    return crec.save();
                }
            }));

            user.editorChannels = user.editorChannels.filter(cid =>
                !channels.find(c => c._id.equals(cid)));
        }

        let err = null;

        try {
            user = await user.save()
        } catch(e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        user = await UserService.#getSecureUserRecord({ handle: user.handle })

        return Service.successResponse(UserService.#makeUserObject(user));
    }

    static async grantAdmin({ handle }) {
        
        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        let user = await User.findOne({ handle: handle });

        if (user) {
            
            // If this throws it should be caught by the controller since 
            // is a 5xx error
            user.admin = true;
            await user.save();  

            return Service.successResponse()

        } else {
            Service.rejectResponse({ message: "User not found" });
        }

    }

    static async revokeAdmin({ handle }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        let user = await User.findOne({ handle: handle });

        if (user) {

            // If this throws it should be caught by the controller since 
            // is a 5xx error
            user.admin = false;
            await user.save();

            return Service.successResponse();

        } else {
            Service.rejectResponse({ message: "User not found" });
        }
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

    static async changeSmm({ handle, operation, smm }){

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })

        // Parameters check

        if ((operation !== 'remove') && (operation !== 'change')) {
            return Service.rejectResponse({ message: `Unknown operation: '${operation}'` });
        }

        if ((operation !== 'remove') && (!smm)) {
            return Service.rejectResponse({ message: "Must provide a valid handle to the smm field if the operation is not 'remove'" });
        } 

        // User Fetching

        const user = await User.findOne({ handle: handle });

        if (!user) return Service.rejectResponse({ message: `User '${handle}' not found` });

        // if op was remove we are done
        if (operation === 'remove') {

            user.smm = null;

            await user.save();

            return Service.successResponse();
        }

        // else it was change, fetch new user and set smm
        const new_smm_acc = await User.findOne({ handle: smm });

        if (!new_smm_acc) return Service.rejectResponse({ message: `User '${smm}' not found` });


        // operation was 'change'
        user.smm = new_smm_acc._id;
        
        let err = null;

        try {
            await user.save();
        } catch (e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);

        return Service.successResponse()
    }

    static async removeManaged({ handle, users }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        let urec = await UserService.#getSecureUserRecord({ handle: handle });
        
        let user_records = await User.find().where('handle').in(users);

        await Promise.all(user_records.map(u => {
            if (urec._id.equals(u.smm)) {
                u.smm = null;
                return u.save()
            }
        }));

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

        const res = await user.populate('managed', 'handle charLeft');

        return Service.successResponse(res.managed.map(o => ({
            handle: o.handle,
            charLeft: o.charLeft,
        })));
    }

    /**
     * Service to update a user subscription. Can be used to subscribe to a new plan or modify 
     * the auto-renew feature.
     * 
     * Trying to set the autoRenew field in a user that has no subscription or trying to
     * subscribe a user to a non-existent plan will result in a rejectResponse.
     * 
     * @param {Object} param0 The service parameters
     * @param {User} param0.reqUser The user record fetched for authentication
     * @param {string} param0.handle The user's handle
     * @param {(mongoose.ObjectIdExpression|null)} param0.proPlanId The new plan's id
     * @param {(boolean|null)} param0.autoRenew The new auto-renew value.
     * @returns Service.successResponse or Service.rejectResponse
     */
    static async changeSubscription({ reqUser, handle, proPlanId=null, autoRenew=null }) {
        
        let pro_plan = null;
        if (proPlanId) {

            pro_plan = await Plan.findById(proPlanId);
            
            if (!pro_plan) return Service.rejectResponse({
                message: `No pro plan with id ${proPlanId}`
            })
        }

        let user = reqUser;

        if (pro_plan) {
            
            let expiration_date;
            
            switch (pro_plan.period) {
                case 'month':
                    expiration_date = (new dayjs).add(1, 'month').toDate();
                    break;
                case 'year':
                    expiration_date = (new dayjs).add(1, 'year').toDate();
                    break;
            }

            user.subscription = {
                proPlan: pro_plan._id,
                expires: expiration_date,
            }

            if (pro_plan.pro) user.accountType = 'pro';
            else user.accountType = 'user';
        }

        if (autoRenew !== null) {
            if (!user.subscription) 
                return Service.rejectResponse({ message: `User @${handle} has no subscription plan active` })
            
            user.subscription.autoRenew = autoRenew;
        }

        await user.save();

        return Service.successResponse()
    }

    /**
     * Sets the subscription field to null. If the execution gets to this function then the
     * user exists, so it will always return sucessResponse.
     * 
     * @param {Object} param0 The sercice parameters
     * @param {User} param0.reqUser The user record fetched for authentication
     * @returns Service.successResponse
     */
    static async deleteSubscription({ reqUser }) {
        reqUser.subscription = null;
        await reqUser.save();
        return Service.successResponse();   
    }
}

module.exports = UserService;