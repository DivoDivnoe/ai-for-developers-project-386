import "@typespec/http";
import "@typespec/rest";
import "@typespec/versioning";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.Versioning;

@versioned(Versions)
@service(#{title: "Call Booking API"})
namespace ProjectApi;

enum Versions {
  v1: "1.0.0",
}

// --- Scalars ---

@format("uuid")
scalar uuid extends string;

// --- Enums & Unions ---

union MeetingDuration {
  fifteen: 15,
  thirty: 30,
}

enum DayOfWeek {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

enum BookingStatus {
  confirmed,
  cancelled,
}

// --- Models ---

model Owner {
  name: string;
  email: string;
  bio?: string;
}

model Booking {
  id: uuid;
  startAt: utcDateTime;
  duration: MeetingDuration;
  name: string;
  email: string;
  comment?: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  startAt: utcDateTime;
  duration: MeetingDuration;
  name: string;
  email: string;
  comment?: string;
}

model Slot {
  startAt: utcDateTime;
  endAt: utcDateTime;
  duration: MeetingDuration;
}

model AvailabilityInterval {
  id: uuid;
  dayOfWeek: DayOfWeek;
  startTime: plainTime;
  endTime: plainTime;
}

model CreateAvailabilityIntervalRequest {
  dayOfWeek: DayOfWeek;
  startTime: plainTime;
  endTime: plainTime;
}

model ScheduleException {
  id: uuid;
  startDate: plainDate;
  endDate: plainDate;
  startTime?: plainTime;
  endTime?: plainTime;
  reason?: string;
}

model CreateScheduleExceptionRequest {
  startDate: plainDate;
  endDate: plainDate;
  startTime?: plainTime;
  endTime?: plainTime;
  reason?: string;
}

model HealthCheck {
  status: string;
}

// --- Operations ---

@route("/health")
@get
op health(): HealthCheck;

@route("/owner")
@get
op getOwner(): Owner;

@route("/slots")
@get
op getSlots(@query date: plainDate, @query duration: MeetingDuration): Slot[];

@route("/bookings")
interface Bookings {
  @get
  list(): Booking[];

  @post
  create(@body body: CreateBookingRequest): Booking;

  @get
  @route("/{id}")
  get(@path id: uuid): Booking;

  @delete
  @route("/{id}")
  cancel(@path id: uuid): Booking;
}

@route("/availability")
interface Availability {
  @get
  list(): AvailabilityInterval[];

  @post
  create(@body body: CreateAvailabilityIntervalRequest): AvailabilityInterval;

  @put
  @route("/{id}")
  update(@path id: uuid, @body body: CreateAvailabilityIntervalRequest): AvailabilityInterval;

  @delete
  @route("/{id}")
  remove(@path id: uuid): void;
}

@route("/exceptions")
interface Exceptions {
  @get
  list(): ScheduleException[];

  @post
  create(@body body: CreateScheduleExceptionRequest): ScheduleException;

  @put
  @route("/{id}")
  update(@path id: uuid, @body body: CreateScheduleExceptionRequest): ScheduleException;

  @delete
  @route("/{id}")
  remove(@path id: uuid): void;
}
