import mongoose from "mongoose";

let courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is compulsory'],
        minLength: [8, 'Title must be longer'],
        maxLength: [30, 'Title must be shorter']
    },
    description: {
        type: String,
        required: [true, 'Description is compulsory'],
        minLength: [10, 'Description must be longer']
    },
    lectures: [
        {
            title: {
                type: String,
                required: [true, 'Lecture title is compulsory']
            },
            description: {
                type: String,
                required: [true, 'Lecture description is compulsory']
            },
            video: {
                public_id: {
                    type: String,
                    required: [true, 'Public id of the video is compulsory']
                },
                url: {
                    type: String,
                    required: [true, 'Url of the video is compulsory']
                }
            }
        }
    ],
    poster: {
        public_id: {
            type: String,
            required: [true, 'Public id of the poster is compulsory']
        },
        url: {
            type: String,
            required: [true, 'Url of the poster is compulsory']
        }
    },
    views: {
        type: Number,
        default: 0
    },
    numOfVideos: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Course category is compulsory']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String,
        required: [true, 'Creator name is compulsory']
    }
})

export default mongoose.model('Course', courseSchema)