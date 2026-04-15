from enum import Enum as PyEnum



#for users authentification
class Role(str, PyEnum):
    incoming_corper = "incoming_corper"
    outgoing_corper = "outgoing_corper"
    landlord        = "landlord"
    admin           = "admin"
    
class Status(str, PyEnum):
    active="active"
    suspended ="suspended"