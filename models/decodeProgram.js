const mongoose = require('mongoose');

const UpcomingEventSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}$/, 'Date must be in MMM DD, YYYY format']
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    minlength: [5, 'Event name must be at least 5 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    minlength: [3, 'Location must be at least 3 characters']
  },
  organiser: {
    type: String,
    required: [true, 'Organizer is required'],
    minlength: [3, 'Organizer name must be at least 3 characters']
  },
  price: {
    type: String,
    required: [true, 'Price is required'],
    match: [/^\$\s?\d+(,\d{3})*(\.\d{2})?$/, 'Price must be in currency format']
  },
  paymentLink: {
    type: String,
    required: [true, 'Payment link is required'],
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Invalid URL format']
  }
});

const LearningSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    minlength: [5, 'Section title must be at least 5 characters']
  },
  points: [{
    type: String,
    required: [true, 'Learning point is required'],
    minlength: [5, 'Learning point must be at least 5 characters']
  }]
});

const DecodeProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [5, 'Title must be at least 5 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    minlength: [5, 'Subtitle must be at least 5 characters']
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    minlength: [3, 'Duration must be at least 3 characters']
  },
  cardPoints: [{
    type: String,
    required: [true, 'Card point is required'],
    minlength: [5, 'Card point must be at least 5 characters']
  }],
  learningSections: [LearningSectionSchema],
  upcomingEvents: [UpcomingEventSchema],
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
}, { timestamps: true });

module.exports = mongoose.model('DecodeProgram', DecodeProgramSchema);