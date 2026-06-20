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
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
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

// --- Errors ---

@error
model ApiError {
  message: string;
}

@error
model BadRequestResponse {
  @statusCode _: 400;
  @body error: ApiError;
}

@error
model NotFoundResponse {
  @statusCode _: 404;
  @body error: ApiError;
}

@error
model ConflictResponse {
  @statusCode _: 409;
  @body error: ApiError;
}

@error
model InternalErrorResponse {
  @statusCode _: 500;
  @body error: ApiError;
}

// --- Operations ---

@route("/health")
@get
op health(): HealthCheck | InternalErrorResponse;

@route("/owner")
@get
op getOwner(): Owner | InternalErrorResponse;

@route("/slots")
@get
op getSlots(@query date: plainDate, @query duration: MeetingDuration): Slot[] | BadRequestResponse | InternalErrorResponse;

@route("/bookings")
interface Bookings {
  @get
  list(): Booking[] | InternalErrorResponse;

  @post
  create(@body body: CreateBookingRequest): Booking | BadRequestResponse | ConflictResponse;

  @get
  @route("/{id}")
  get(@path id: uuid): Booking | NotFoundResponse;

  @delete
  @route("/{id}")
  cancel(@path id: uuid): Booking | NotFoundResponse;
}

@route("/availability")
interface Availability {
  @get
  list(): AvailabilityInterval[] | InternalErrorResponse;

  @post
  create(@body body: CreateAvailabilityIntervalRequest): AvailabilityInterval | BadRequestResponse;

  @put
  @route("/{id}")
  update(@path id: uuid, @body body: CreateAvailabilityIntervalRequest): AvailabilityInterval | NotFoundResponse | BadRequestResponse;

  @delete
  @route("/{id}")
  remove(@path id: uuid): void | NotFoundResponse;
}

@route("/exceptions")
interface Exceptions {
  @get
  list(): ScheduleException[] | InternalErrorResponse;

  @post
  create(@body body: CreateScheduleExceptionRequest): ScheduleException | BadRequestResponse;

  @put
  @route("/{id}")
  update(@path id: uuid, @body body: CreateScheduleExceptionRequest): ScheduleException | NotFoundResponse | BadRequestResponse;

  @delete
  @route("/{id}")
  remove(@path id: uuid): void | NotFoundResponse;
}
