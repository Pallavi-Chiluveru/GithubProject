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
    displayName:{
        type:String,
        default: ""
    },
    bio:{
        type:String,
        default: ""
    },
    company:{
        type:String,
        default: ""
    },
    location:{
        type:String,
        default: ""
    },
    profileImageUrl:{
        type:String,
        default: ""
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        default: []
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        default: []
    }],
    socialLinks: {
        website: { type: String, default: "" },
        twitter: { type: String, default: "" },
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" }
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
    googleId: {
        type: String,
        default: "",
        index: true
    },
    authProvider: {
        type: String,
        default: "local",
        enum: ["local", "google"]
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
