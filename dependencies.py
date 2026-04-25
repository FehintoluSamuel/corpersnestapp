from enum import Enum as PyEnum

# for users authentication
class Role(str, PyEnum):
    incoming_corper = "incoming_corper"
    outgoing_corper = "outgoing_corper"
    landlord = "landlord"
    admin = "admin"

class Status(str, PyEnum):
    active = "active"
    suspended = "suspended"

# for listings
class ListingType(str, PyEnum):
    corper_room = "corper_room"
    landlord_property = "landlord_property"

class ListingStatus(str, PyEnum):
    active = "active"
    taken = "taken"
    inactive = "inactive"

# for community feed
class PostTag(str, PyEnum):
    question = 'question'
    tip = 'tip'
    room_available = 'room_available'
    roommate_needed = 'roommate_needed'   # ← add this
    scam_warning = 'scam_warning'
    general = 'general'