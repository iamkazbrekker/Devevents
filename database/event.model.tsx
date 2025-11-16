import mongoose, { Document, Model, Schema } from "mongoose";

// Strongly-typed Event interface
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO date string (YYYY-MM-DD)
  time: string; // stored as 24-hour HH:mm
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Utility: create a URL-friendly slug from title
const makeSlug = (s: string) =>
  s
    .toString()
    .trim()
    .toLowerCase()
    // replace spaces and invalid chars with -
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Utility: normalize date to YYYY-MM-DD (ISO date)
const normalizeDate = (d: string): string => {
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) {
    throw new Error("Invalid date format. Expected a valid date string.");
  }
  return parsed.toISOString().split("T")[0];
};

// Utility: normalize time to 24-hour HH:mm
const normalizeTime = (t: string): string => {
  const raw = String(t).trim();
  // match H:MM, HH:MM, with optional AM/PM
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/);
  if (!m) throw new Error("Invalid time format. Use H:MM, HH:MM or include AM/PM.");

  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3] ? m[3].toLowerCase() : null;

  if (ampm) {
    if (hour === 12) hour = ampm === "am" ? 0 : 12;
    else hour = ampm === "pm" ? hour + 12 : hour;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Time value out of range.");
  }

  const hh = hour.toString().padStart(2, "0");
  const mm = minute.toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

// Schema definition with strict typing and validation
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Title cannot be empty",
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: { type: String, required: [true, "Description required"], trim: true },
    overview: { type: String, required: [true, "Overview required"], trim: true },
    image: { type: String, required: [true, "Image required"], trim: true },
    venue: { type: String, required: [true, "Venue required"], trim: true },
    location: { type: String, required: [true, "Location required"], trim: true },
    date: { type: String, required: [true, "Date required"], trim: true },
    time: { type: String, required: [true, "Time required"], trim: true },
    mode: { type: String, required: [true, "Mode required"], trim: true },
    audience: { type: String, required: [true, "Audience required"], trim: true },
    agenda: {
      type: [String],
      required: [true, "Agenda required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must be a non-empty array",
      },
    },
    organizer: { type: String, required: [true, "Organizer required"], trim: true },
    tags: {
      type: [String],
      required: [true, "Tags required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v),
        message: "Tags must be an array",
      },
    },
  },
  {
    timestamps: true, // auto-generate createdAt and updatedAt
    strict: true,
  }
);

// Add unique index on slug for fast lookup and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook: generate slug only when title changes; normalize date & time
EventSchema.pre<IEvent>("save", function (next) {
  try {
    // Generate slug only when title modified or missing
    if (this.isModified("title") || !this.slug) {
      this.slug = makeSlug(this.title);
    }

    // Normalize and validate date to ISO YYYY-MM-DD
    if (this.isModified("date") || !this.date) {
      this.date = normalizeDate(this.date);
    }

    // Normalize and validate time to HH:mm
    if (this.isModified("time") || !this.time) {
      this.time = normalizeTime(this.time);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

// Export the Event model; protect against recompilation in dev/hot-reload
const EventModel: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) || mongoose.model<IEvent>("Event", EventSchema);

export default EventModel;