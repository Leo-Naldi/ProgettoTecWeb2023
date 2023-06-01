const { default: mongoose } = require("mongoose");

const config = require('../config/index')
const User = require("../models/User");
const makeToken = require("../utils/makeToken");
const Service = require("./Service");
const Channel = require("../models/Channel");

class UserService {

    static async getUsers({ handle, admin, accountType, page = 1 } = { page: 1}){
        let filter = new Object();

        if (handle) filter.handle = handle;
        if ((admin === true) || (admin === false)) filter.admin = admin;
        if (accountType) filter.accountType = accountType;

        const users = await User.find(filter)
            .select('-__v -password')
            .sort('meta.created')
            .skip((page - 1) * config.results_per_page)
            .limit(config.results_per_page);

        return Service.successResponse(users.map(u => u.toObject()));
    }

    static async getUser({ handle }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        let user = await User.findOne({ handle: handle }).select('-__v -password');

        if (!user) return Service.rejectResponse({ message: "User not found" });

        if (user.messages instanceof Array) {
            user = await user.populate('messages');
        }

        let managed = await User.find({ smm: user._id }).select('-password -messages');

        let result = { ...(user.toObject()), managed: managed.map(u => u.handle) };

        return Service.successResponse(result);        
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

        if (!user) return Service.rejectResponse({ message: 'User not found' })
        const res = await user.deleteOne();
        
        return Service.successResponse()
    }

    static async writeUser({ handle, username,
        email, password, name, lastName, 
        phone, gender, blocked,
        accountType, charLeft, addJoinedChannels, 
        removeJoinedChannels,
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

        if (addJoinedChannels instanceof Array) {
            for(let i = 0; i < addJoinedChannels.length; i++) {
                let crec = await Channel.findOne({ name: addJoinedChannels[i] });

                if(!user.joinedChannels.some(cid => cid.equals(crec._id))) {
                    user.joinedChannels.push(crec._id);
                    crec.members.push(user._id);

                    await crec.save();
                }
            }
        }

        if (removeJoinedChannels instanceof Array) {

            let cids = []

            for (let i = 0; i < removeJoinedChannels.length; i++) {
                let crec = await Channel.findOne({ name: removeJoinedChannels[i] });

                cids.push(crec._id);
                crec.members = crec.members.filter(uid => !uid.equals(user._id));
                await crec.save();
            }

            user.joinedChannels = user.joinedChannels.filter(cid =>
                !cids.some(id => id.equals(cid)));
        }

        let err = null;

        try {
            user = await user.save()
        } catch(e) {
            err = e;
        }

        if (err) return Service.rejectResponse(err);
        
        return Service.successResponse(user);
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

    // TODO change name to remove managed
    static async changeManaged({ handle, reqUser, users }) {

        if (!handle) return Service.rejectResponse({ message: "Did not provide a handle" })
        
        // User Fetching

        let urec = reqUser;

        // In theory this cant happen but oh well
        if (urec.handle !== handle) {

            urec = await User.findOne({ handle: handle });

            if (!urec) return Service.rejectResponse({ message: `No user called ${handle}` })
        }

        if (users instanceof Array) {
          
            if (users.length > 0) {

                for (let i = 0; i < users.length; i++) {

                    let u = await User.findOne({ handle: users[i] });

                    if ((u.smm) && (u.smm.equals(urec._id))) {

                        u.smm = null;
                        await u.save();
                    }
                }
            }
            
        }

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

        const res = await User.find({ smm: user._id }).select('-__v -password');

        return Service.successResponse(res.map( u => u.toObject()));
    }
}

module.exports = UserService;