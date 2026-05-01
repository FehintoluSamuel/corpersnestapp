from enum import Enum as PyEnum


# ─── User roles ───────────────────────────────────────────────────────────────

class Role(str, PyEnum):
    pcm             = "pcm"               # Prospective Corp Member (no state code yet)
    incoming_corper = "incoming_corper"   # Has state code, still in camp or just arrived
    outgoing_corper = "outgoing_corper"   # Active service year
    alumni          = "alumni"            # Completed service
    landlord        = "landlord"          # Property owner
    admin           = "admin"             # Platform administrator


# ─── User status ──────────────────────────────────────────────────────────────

class Status(str, PyEnum):
    active                = "active"
    suspended             = "suspended"
    pending_verification  = "pending_verification"  # Landlords awaiting admin approval


# ─── Listings ─────────────────────────────────────────────────────────────────

class ListingType(str, PyEnum):
    corper_room         = "corper_room"
    landlord_property   = "landlord_property"


class ListingStatus(str, PyEnum):
    active   = "active"
    taken    = "taken"
    inactive = "inactive"


# ─── Community feed ───────────────────────────────────────────────────────────

class PostTag(str, PyEnum):
    question        = "question"
    tip             = "tip"
    room_available  = "room_available"
    roommate_needed = "roommate_needed"
    scam_warning    = "scam_warning"
    general         = "general"


# ─── Reports ──────────────────────────────────────────────────────────────────

class ReportType(str, PyEnum):
    listing = "listing"   # Reporting a listing
    user    = "user"      # Reporting a user


class ReportStatus(str, PyEnum):
    open     = "open"      # Newly submitted, not yet reviewed
    reviewed = "reviewed"  # Admin has seen it, investigation ongoing
    resolved = "resolved"  # Closed — action taken or dismissed 


 #  ─── Connections──────────────────────────────────────────────────────────────────
class ConnectionStatus(str, PyEnum):
    pending  = 'pending'
    accepted = 'accepted'
    rejected = 'rejected'
    blocked  = 'blocked'