import mongoose, { Document, Model, Schema } from "mongoose";
import EventModel, { IEvent } from "./event.model";

// Strongly-typed Booking interface
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId | IEvent["_id"];
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple email regex for validation (covers most common cases)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: [true, "eventId required"] },
    email: {
      type: String,
      required: [true, "Email required"],
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_RE.test(v),
        message: "Invalid email format",
      },
    },
  },
  { timestamps: true, strict: true }
);

// Index on eventId for faster lookups
BookingSchema.index({ eventId: 1 });

// Pre-save hook: verify referenced event exists before saving booking
BookingSchema.pre<IBooking>("save", async function (next) {
  try {
    const exists = await EventModel.exists({ _id: this.eventId });
    if (!exists) {
      throw new Error("Referenced event does not exist");
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Export Booking model (guard against model recompilation)
const BookingModel: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
