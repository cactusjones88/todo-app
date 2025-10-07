const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: [true, 'Task is required'],
        trim: true,
        minlength: [1, 'Task cannot be empty']
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add index for better performance
todoSchema.index({ completed: 1, createdAt: -1 });

module.exports = mongoose.model('Todo', todoSchema);