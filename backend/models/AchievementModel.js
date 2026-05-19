import { Schema, model } from 'mongoose';

const achievementSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    badgeUrl: {
        type: String,
        required: true
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

achievementSchema.index({ user: 1, title: 1 }, { unique: true });

export const AchievementModel = model('Achievement', achievementSchema);
