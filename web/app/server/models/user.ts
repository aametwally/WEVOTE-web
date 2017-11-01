// grab the things we need
import * as Defs from './model';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as passportLocalMongoose from 'passport-local-mongoose';
import * as common from '../common/common';

export interface IUserModel extends common.IUser, mongoose.PassportLocalDocument {
}

export class UserModel {
    public static schema =
    <mongoose.PassportLocalSchema>new mongoose.Schema({
        // username and password added as passport plugin.
        admin: {
            type: Boolean,
            default: false
        },
        email: {
            type: String
        }
    }, {
            timestamps: true
        }).plugin(passportLocalMongoose);

    private static _model = <mongoose.PassportLocalModel<IUserModel>>
    mongoose.model<IUserModel>('User', UserModel.schema);
    public static repo = new Defs.RepositoryBase<IUserModel>(UserModel._model);
    public static register = (user: IUserModel, password: string, cb: (err: any, account: any) => void) => {
        UserModel._model.register(user, password, cb);
    }
    public static model = (args: any) => {
        return new UserModel._model(args);
    }

    public static usePassportLocalStrategyAuthenticate() {
        passport.use(new passportLocal.Strategy(
            UserModel._model.authenticate()));
        passport.serializeUser(UserModel._model.serializeUser());
        passport.deserializeUser(UserModel._model.deserializeUser());
    }

    public static reset = (cb?: ( id: mongoose.Types.ObjectId ) => void ) => {
        UserModel.repo.drop(function (err: any) {
            if (err) throw err;
            console.log("Users cleared");
            UserModel.register(
                UserModel.model({ username: "asem_alla" }),
                "qwerasdf",
                function (err, user) {
                    if (err) throw err;
                    console.log("user created:" + user );
                    if( cb ) cb( user._id );
                });
        });
    }
}
