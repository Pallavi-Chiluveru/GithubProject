import {Schema, model} from 'mongoose'

const userSchema = new Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        unique: true
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:[true,"email already exists"]
    },
    password:{
        type:String,
        required:[true,"password is mandatory"],
    },
    gitname:{
        type:String,
        default: ""
    },
    bio:{
        type:String,
        default: ""
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    },
    sshKeys: [{
        title: { type: String, required: true },
        key: { type: String, required: true },
        addedAt: { type: Date, default: Date.now }
    }],
    notificationPrefs: {
        emailOnMention: { type: Boolean, default: true },
        emailOnReview: { type: Boolean, default: true },
        emailOnPush: { type: Boolean, default: false },
        webNotifications: { type: Boolean, default: true }
    },
    appearance: {
        theme: { type: String, default: "light", enum: ["dark", "light"] },
        fontSize: { type: String, default: "medium", enum: ["small", "medium", "large"] }
    },
    // ─── Gitea Identity ────────────────────────────────────────────────────────
    // Every user has a mirrored Gitea account for real Git operations.
    giteaUserId:   { type: Number, default: null },          // Gitea numeric user ID
    giteaUsername: { type: String, default: "" },            // Gitea login username
    giteaToken:    { type: String, default: "" },            // AES-256-GCM encrypted PAT
    giteaSynced:   { type: Boolean, default: false }         // Whether Gitea account exists
},{
    versionKey:false,
    timestamps:true,
    strict: false
})

export const UserModel=model("user",userSchema);
