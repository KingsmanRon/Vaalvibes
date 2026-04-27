from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Literal, Optional

import hmac
import logging
import os
import re
import uuid

import jwt
import resend
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("APP_JWT_SECRET", "vaal-vibes-jwt-secret-2026-ultra-secure")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24 * 7
PROMO_SECRET = os.environ.get("PROMO_SIGNING_SECRET", "vaal-vibes-promo-secret-2026-ultra-secure")

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "Vaal Vibes <noreply@vaalvibes.co.za>")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

LOGO_URL = "/vv-logo-full.png"
BANNER_URL = "/vibes.jpeg"

# Create the main app without a prefix
app = FastAPI(title="Vaal Vibes API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Models
class MessageResponse(BaseModel):
    message: str


class PromoInfo(BaseModel):
    percentage_discount: int
    min_spend: float
    expires_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Literal["customer", "marketing", "promo", "super"]
    user_id: str
    name: str
    email: str
    promo: Optional[PromoInfo] = None
    demo_mfa_code: Optional[str] = None


class UserPreferencePayload(BaseModel):
    dietary: List[str] = Field(default_factory=list)
    seating: str = "indoor"
    music_vibe: str = "afro-house"
    marketing_opt_in: bool = True


class CustomerRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    dob: Optional[str] = None
    preferences: UserPreferencePayload = Field(default_factory=UserPreferencePayload)


class CustomerLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    email: str
    password: str
    otp: str


class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    price: float
    price_label: str
    category: str
    subcategory: str = ""
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None


class MenuCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    items: List[MenuItem] = Field(default_factory=list)


class EventItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date: datetime
    description: str
    lineup: List[str] = Field(default_factory=list)
    image_url: str
    location: str = "Vaal Vibes"
    status: Literal["scheduled", "live", "archived"] = "scheduled"
    cta_label: str = "RSVP Intent"


class EventCreateRequest(BaseModel):
    title: str
    date: datetime
    description: str
    lineup: List[str] = Field(default_factory=list)
    image_url: str
    location: str = "Vaal Vibes"
    status: Literal["scheduled", "live", "archived"] = "scheduled"
    cta_label: str = "RSVP Intent"


class SpecialItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price_label: str
    image_url: str
    available_until: datetime
    tags: List[str] = Field(default_factory=list)
    status: Literal["active", "inactive"] = "active"


class SpecialCreateRequest(BaseModel):
    title: str
    description: str
    price_label: str
    image_url: str
    available_until: datetime
    tags: List[str] = Field(default_factory=list)
    status: Literal["active", "inactive"] = "active"


class MenuCategoryCreateRequest(BaseModel):
    name: str
    slug: str
    description: str = ""


class MenuItemCreateRequest(BaseModel):
    name: str
    description: str = ""
    price: float
    price_label: str
    category: str = ""
    subcategory: str = ""
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None


DRIVE_ID_RE = re.compile(r"(?:/d/|[?&]id=)([a-zA-Z0-9_-]{20,})")


def extract_drive_id(url_or_id: str) -> str:
    value = (url_or_id or "").strip()
    if not value:
        raise HTTPException(status_code=400, detail="Drive URL or file ID is required")
    match = DRIVE_ID_RE.search(value)
    if match:
        return match.group(1)
    # Treat as bare file ID if it looks like one
    if re.fullmatch(r"[a-zA-Z0-9_-]{20,}", value):
        return value
    raise HTTPException(status_code=400, detail="Could not extract a Google Drive file ID from the input")


class GalleryPhoto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    drive_file_id: str
    caption: str = ""
    sort_order: int = 0
    added_by: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GalleryPhotoCreateRequest(BaseModel):
    url_or_id: str
    caption: str = ""
    sort_order: int = 0


class GalleryPhotoUpdateRequest(BaseModel):
    caption: str = ""
    sort_order: int = 0


class GalleryBulkCreateRequest(BaseModel):
    text: str


class GalleryBulkResult(BaseModel):
    added: int
    skipped_duplicates: int
    failed: int
    errors: List[str] = Field(default_factory=list)
    photos: List[GalleryPhoto] = Field(default_factory=list)


class PromoPool(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    discount_type: Literal["percentage", "amount"] = "percentage"
    discount_value: float
    min_spend: float
    start_at: datetime
    end_at: datetime
    max_redemptions: int = 1
    audience: str = "all"
    active: bool = False


class PromoPoolCreateRequest(BaseModel):
    name: str
    discount_type: Literal["percentage", "amount"] = "percentage"
    discount_value: float
    min_spend: float
    start_at: datetime
    end_at: datetime
    max_redemptions: int = 1
    audience: str = "all"
    active: bool = False


class PromoCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    pool_id: str
    code: str
    signature: str
    discount_type: Literal["percentage", "amount"] = "percentage"
    discount_value: float
    min_spend: float
    status: Literal["active", "redeemed", "revoked", "expired"] = "active"
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    redeemed_at: Optional[datetime] = None
    redemption_count: int = 0


class CustomerProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    dob: Optional[str] = None
    preferences: UserPreferencePayload
    created_at: datetime


class RequestLineItem(BaseModel):
    name: str
    quantity: int = 1
    price: float = 0


class CustomerRequestCreate(BaseModel):
    request_type: Literal["reservation", "order-intent"]
    date: datetime
    guest_count: int = 2
    notes: str = ""
    items: List[RequestLineItem] = Field(default_factory=list)
    contact_phone: str


class BirthdayBookingCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    date_of_birth: str
    celebration_date: datetime
    arrival_time: str
    guest_count: int
    estimated_budget: float
    seating_preference: Literal["indoor", "patio", "vip"] = "vip"
    bottle_service: bool = False
    notes: str = ""


class CustomerRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference_id: str
    user_id: str
    request_type: Literal["reservation", "order-intent", "birthday-booking"]
    date: datetime
    guest_count: int
    notes: str = ""
    items: List[RequestLineItem] = Field(default_factory=list)
    contact_phone: str
    status: Literal["pending", "confirmed", "completed", "cancelled"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    estimated_budget: Optional[float] = None
    arrival_time: Optional[str] = None
    occasion: Optional[str] = None
    seating_preference: Optional[str] = None
    date_of_birth: Optional[str] = None
    bottle_service: Optional[bool] = None


class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: str
    audience: str
    body_html: str
    status: Literal["draft", "sending", "sent", "partial", "failed", "mock-dispatched"] = "draft"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CampaignCreateRequest(BaseModel):
    subject: str
    audience: str
    body_html: str


class CustomerSummary(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    created_at: datetime
    marketing_opt_in: bool


class AuditLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    actor_id: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str
    summary: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PromoValidationRequest(BaseModel):
    code: str
    bill_amount: float
    customer_phone: Optional[str] = None


class PromoValidationResponse(BaseModel):
    approved: bool
    code: str
    reason: str
    discount_amount: float = 0
    status: str
    min_spend: float
    bill_amount: float
    promo_id: Optional[str] = None
    expires_at: Optional[datetime] = None


class DashboardKpi(BaseModel):
    label: str
    value: int


class DashboardSeriesPoint(BaseModel):
    name: str
    value: int


class DashboardResponse(BaseModel):
    kpis: List[DashboardKpi]
    redemptions_over_time: List[DashboardSeriesPoint]
    request_breakdown: List[DashboardSeriesPoint]
    recent_requests: List[CustomerRequest]


class PublicBootstrapResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    venue_name: str
    tagline: str
    logo_url: str
    hero_image_url: str
    menu: List[MenuCategory]
    events: List[EventItem]
    specials: List[SpecialItem]
    venue_hours: List[str]
    service_note: str
    gallery: List[GalleryPhoto] = Field(default_factory=list)


# Helpers

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def create_token(subject: str, role: str, name: str, email: str) -> str:
    payload = {
        "sub": subject,
        "role": role,
        "name": name,
        "email": email,
        "exp": now_utc() + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "iat": now_utc(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.replace("Bearer ", "", 1)


async def get_current_customer(authorization: Optional[str] = Header(default=None)) -> dict:
    token = get_bearer_token(authorization)
    payload = decode_token(token)
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required")
    user = await db.customers.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer not found")
    return user


async def get_current_admin(authorization: Optional[str] = Header(default=None)) -> dict:
    token = get_bearer_token(authorization)
    payload = decode_token(token)
    if payload.get("role") not in {"marketing", "promo", "super"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    user = await db.admin_users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")
    return user


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def serialize(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return None
    doc.pop("_id", None)
    return doc


def serialize_many(docs: List[dict]) -> List[dict]:
    return [serialize(doc) for doc in docs]


def ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def promo_signature(code: str, user_id: str, pool_id: str) -> str:
    digest = hmac.new(PROMO_SECRET.encode(), f"{code}:{user_id}:{pool_id}".encode(), "sha256").hexdigest()
    return digest[:16].upper()


def build_birthday_notes(payload: BirthdayBookingCreate) -> str:
    extras = [
        f"Birthday booking for {payload.full_name}",
        f"DOB: {payload.date_of_birth}",
        f"Arrival time: {payload.arrival_time}",
        f"Estimated budget: R{payload.estimated_budget:.2f}",
        f"Seating: {payload.seating_preference}",
        f"Bottle service: {'yes' if payload.bottle_service else 'no'}",
    ]
    if payload.notes:
        extras.append(f"Notes: {payload.notes}")
    return " | ".join(extras)


async def ensure_demo_customer_active_promo() -> None:
    demo_customer = await db.customers.find_one({"email": "guest@vaalvibes.app"}, {"_id": 0})
    if not demo_customer:
        return
    active_promo = await db.promo_codes.find_one(
        {"user_id": demo_customer["id"], "status": "active"},
        {"_id": 0},
    )
    if not active_promo:
        await issue_welcome_promo(demo_customer["id"])


async def append_audit_log(actor: dict, action: str, entity_type: str, entity_id: str, summary: str) -> None:
    entry = AuditLogEntry(
        actor_id=actor["id"],
        actor_role=actor["role"],
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        summary=summary,
    )
    await db.audit_logs.insert_one(entry.model_dump())


async def get_active_promo_pool() -> dict:
    pool = await db.promo_pools.find_one({"active": True}, {"_id": 0})
    if pool:
        return pool
    fallback = await db.promo_pools.find_one({}, {"_id": 0})
    if not fallback:
        raise HTTPException(status_code=500, detail="No promo pool configured")
    return fallback


async def issue_welcome_promo(user_id: str) -> PromoCode:
    pool = await get_active_promo_pool()
    code_value = f"VV-{uuid.uuid4().hex[:8].upper()}"
    signature = promo_signature(code_value, user_id, pool["id"])
    promo = PromoCode(
        user_id=user_id,
        pool_id=pool["id"],
        code=code_value,
        signature=signature,
        discount_type=pool["discount_type"],
        discount_value=pool["discount_value"],
        min_spend=pool["min_spend"],
        expires_at=pool["end_at"],
    )
    await db.promo_codes.insert_one(promo.model_dump())
    return promo


async def repair_promo_signatures() -> None:
    promos = await db.promo_codes.find({}, {"_id": 0}).to_list(length=1000)
    for promo in promos:
        expected_signature = promo_signature(promo["code"], promo["user_id"], promo["pool_id"])
        if promo.get("signature") != expected_signature:
            await db.promo_codes.update_one(
                {"id": promo["id"]},
                {"$set": {"signature": expected_signature}},
            )


async def validate_promo_logic(code: str, bill_amount: float) -> PromoValidationResponse:
    promo = await db.promo_codes.find_one({"code": code.upper()}, {"_id": 0})
    if not promo:
        return PromoValidationResponse(
            approved=False,
            code=code.upper(),
            reason="Promo code not found",
            status="rejected",
            min_spend=0,
            bill_amount=bill_amount,
        )

    if promo_signature(promo["code"], promo["user_id"], promo["pool_id"]) != promo["signature"]:
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason="Signature validation failed",
            status="rejected",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    if promo["status"] == "revoked":
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason="Promo has been revoked",
            status="revoked",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    if promo["status"] == "redeemed":
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason="Promo has already been redeemed",
            status="redeemed",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    if ensure_aware(promo["expires_at"]) < now_utc():
        await db.promo_codes.update_one({"id": promo["id"]}, {"$set": {"status": "expired"}})
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason="Promo has expired",
            status="expired",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    if bill_amount < promo["min_spend"]:
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason=f"Minimum spend is R{promo['min_spend']:.2f}",
            status="rejected",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    if promo["discount_type"] == "percentage" and promo["discount_value"] == 20 and bill_amount <= 1500:
        return PromoValidationResponse(
            approved=False,
            code=promo["code"],
            reason="20% discount applies only to bills exceeding R1500",
            status="rejected",
            min_spend=promo["min_spend"],
            bill_amount=bill_amount,
            promo_id=promo["id"],
            expires_at=promo["expires_at"],
        )

    discount_amount = round(bill_amount * (promo["discount_value"] / 100), 2) if promo["discount_type"] == "percentage" else min(promo["discount_value"], bill_amount)
    return PromoValidationResponse(
        approved=True,
        code=promo["code"],
        reason="Promo approved",
        status="approved",
        min_spend=promo["min_spend"],
        bill_amount=bill_amount,
        promo_id=promo["id"],
        expires_at=promo["expires_at"],
        discount_amount=discount_amount,
    )


async def seed_database() -> None:
    now = now_utc()

    # Default event/special content for first-run seeding only.
    # Admin-created events and specials must survive process restarts.
    events = [
        EventItem(
            title="Friday After Dark",
            date=datetime(2026, 4, 10, 20, 0, 0, tzinfo=timezone.utc),
            description="A premium Friday link-up with deep house selectors, bottle service tables, and late-night braai platters.",
            lineup=["BINOBOY", "TROSHKA", "B&T MUSIQ", "LEMONADE"],
            image_url="/fridayafterdark.PNG",
            status="scheduled",
            cta_label="RSVP Intent",
        ),
        EventItem(
            title="Saturday",
            date=datetime(2026, 4, 11, 18, 0, 0, tzinfo=timezone.utc),
            description="Dress up, book a table, and step into a gold-lit Saturday with headline DJs and curated bottle moments.",
            lineup=["Line-Up Coming Soon"],
            image_url="/birthdaybook.jpg",
            status="scheduled",
            cta_label="Request Booking",
        ),
        EventItem(
            title="FOOTBALL LEAGUE",
            date=datetime(2026, 4, 14, 12, 0, 0, tzinfo=timezone.utc),
            description="Come get your fitness on with our Tuesday League and Friendlies on Thursday.",
            lineup=["14 & 16 April 2026"],
            image_url="/soccer.jpg",
            status="scheduled",
            cta_label="Request Booking",
        ),
    ]
    specials = [
        SpecialItem(
            title="Hungry Platter Special",
            description="The signature platter for your crew: chuck, wors, wings, liver, ribs plus pap, chakalaka, and salsa.",
            price_label="R400.00",
            image_url="/vv-hungry-platter.jpg",
            available_until=now + timedelta(days=7),
            tags=["share", "signature"],
            status="active",
        ),
        SpecialItem(
            title="Sunset Special",
            description="Come join us for a smooth golden-hour.",
            price_label="R150.00",
            image_url="/corona1.jpg",
            available_until=now + timedelta(days=5),
            tags=["happy-hour"],
            status="active",
        ),
        SpecialItem(
            title="Bottle & Booth Night",
            description="2 x Jägermeister only for R1000",
            price_label="Special",
            image_url="/DSC_0697 (1).jpg",
            available_until=now + timedelta(days=10),
            tags=["vip", "table-service"],
            status="active",
        ),
    ]
    if (await db.events.count_documents({})) == 0:
        await db.events.insert_many([event.model_dump() for event in events])
    if (await db.specials.count_documents({})) == 0:
        await db.specials.insert_many([special.model_dump() for special in specials])

    # Only seed static data once
    existing = await db.menu_categories.count_documents({})
    if existing > 0:
        return

    menu_categories = [
        MenuCategory(
            name="Food",
            slug="food",
            description="Braai platters, plates, and sides.",
            items=[
                MenuItem(name="Peckish", description="Serves 2-4. 200g Chuck, 200g Wors, 200g Chicken Wings and 200g Liver. Served with pap, chakalaka and salsa.", price=250, price_label="R250.00", category="Food", subcategory="Platters", featured=True, tags=["share", "popular"]),
                MenuItem(name="Hungry", description="Serves 2-4. 200g Chuck, 300g Wors, 400g Chicken Wings, 300g Liver and 200g Ribs. Served with pap, chakalaka and salsa.", price=400, price_label="R400.00", category="Food", subcategory="Platters", featured=True, tags=["house-special"]),
                MenuItem(name="Die Man", description="Serves 4-6. 400g Chuck, 300g Wors, 500g Chicken Wings and 500g Liver. Served with pap, chakalaka and salsa.", price=450, price_label="R450.00", category="Food", subcategory="Platters", tags=["platter"]),
                MenuItem(name="Die Groot Man", description="Serves 6-8. 500g Chuck, 500g Wors, 500g Chicken Wings, 500g Ribs and 500g Liver. Served with pap, chakalaka and salsa.", price=700, price_label="R700.00", category="Food", subcategory="Platters", tags=["group"]),
                MenuItem(name="Chuck Plate", description="200g Chuck with pap, chakalaka and salsa.", price=90, price_label="R90.00", category="Food", subcategory="Plates"),
                MenuItem(name="Liver Plate", description="200g Liver with pap, chakalaka and salsa.", price=60, price_label="R60.00", category="Food", subcategory="Plates"),
                MenuItem(name="Chicken Wings Plate", description="3 chicken wings with pap, chakalaka and salsa.", price=70, price_label="R70.00", category="Food", subcategory="Plates"),
                MenuItem(name="Wors Plate", description="300g Wors with pap, chakalaka and salsa.", price=80, price_label="R80.00", category="Food", subcategory="Plates"),
                MenuItem(name="Pap", description="Side portion.", price=15, price_label="R15.00", category="Food", subcategory="Extras"),
                MenuItem(name="Chakalaka", description="Side portion.", price=15, price_label="R15.00", category="Food", subcategory="Extras"),
                MenuItem(name="Salsa", description="Side portion.", price=15, price_label="R15.00", category="Food", subcategory="Extras"),
            ],
        ),
        MenuCategory(
            name="Cocktails",
            slug="cocktails",
            description="Signature cocktails and premium mixers.",
            items=[
                MenuItem(name="Long Island", description="Classic long island blend.", price=110, price_label="R110.00", category="Cocktails", subcategory="Classics", featured=True),
                MenuItem(name="Margarita", description="Fresh lime and tequila.", price=90, price_label="R90.00", category="Cocktails", subcategory="Classics"),
                MenuItem(name="Mai Tai", description="Dark rum and citrus.", price=90, price_label="R90.00", category="Cocktails", subcategory="Classics"),
                MenuItem(name="Strawberry Daiquiri", description="Frozen strawberry daiquiri.", price=80, price_label="R80.00", category="Cocktails", subcategory="Frozen"),
                MenuItem(name="Mojito", description="Mint, lime, and rum.", price=70, price_label="R70.00", category="Cocktails", subcategory="Classics"),
                MenuItem(name="Polloma", description="Tequila and grapefruit fizz.", price=70, price_label="R70.00", category="Cocktails", subcategory="Classics"),
                MenuItem(name="Sunset Orange G&T", description="Bright citrus gin and tonic.", price=50, price_label="R50.00", category="Cocktails", subcategory="G&T"),
                MenuItem(name="Pink Berry G&T", description="Berry-forward gin and tonic.", price=50, price_label="R50.00", category="Cocktails", subcategory="G&T"),
            ],
        ),
        MenuCategory(
            name="Vodka",
            slug="vodka",
            description="Vodka bottle service.",
            items=[
                MenuItem(name="Belvedere", description="Bottle.", price=1000, price_label="R1000", category="Vodka", subcategory="Bottle", tags=["premium"]),
                MenuItem(name="Smirnoff 1818", description="Bottle.", price=350, price_label="R350", category="Vodka", subcategory="Bottle"),
                MenuItem(name="Absolut", description="Bottle.", price=650, price_label="R650", category="Vodka", subcategory="Bottle"),
            ],
        ),
        MenuCategory(
            name="Gin",
            slug="gin",
            description="Gin bottle service.",
            items=[
                MenuItem(name="Tanqueray", description="Bottle.", price=650, price_label="R650", category="Gin", subcategory="Bottle"),
                MenuItem(name="Tanqueray 10", description="Bottle.", price=1000, price_label="R1000", category="Gin", subcategory="Bottle", tags=["premium"]),
                MenuItem(name="Gordons", description="Bottle.", price=350, price_label="R350", category="Gin", subcategory="Bottle"),
                MenuItem(name="Hendricks", description="Bottle. Shot R35.", price=800, price_label="R800", category="Gin", subcategory="Bottle"),
                MenuItem(name="Inverroche", description="Bottle.", price=800, price_label="R800", category="Gin", subcategory="Bottle"),
            ],
        ),
        MenuCategory(
            name="Tequila",
            slug="tequila",
            description="Tequila bottle service.",
            items=[
                MenuItem(name="Jose Cuervo", description="Bottle.", price=650, price_label="R650", category="Tequila", subcategory="Bottle"),
                MenuItem(name="Don Julio Blanco", description="Bottle.", price=1500, price_label="R1500", category="Tequila", subcategory="Bottle", tags=["premium"]),
                MenuItem(name="Don Julio Reposado", description="Bottle. Shot R70.", price=2000, price_label="R2000", category="Tequila", subcategory="Bottle", tags=["premium"]),
                MenuItem(name="Don Julio 1942", description="Bottle. Ultra-premium.", price=10000, price_label="R10 000", category="Tequila", subcategory="Bottle", featured=True, tags=["premium", "ultra"]),
            ],
        ),
        MenuCategory(
            name="Whiskey",
            slug="whiskey",
            description="Whiskey bottle service.",
            items=[
                MenuItem(name="Glenfiddich 12", description="Bottle. Shot R50.", price=1600, price_label="R1600", category="Whiskey", subcategory="Bottle", tags=["premium"]),
                MenuItem(name="Jameson Select", description="Bottle.", price=1000, price_label="R1000", category="Whiskey", subcategory="Bottle"),
                MenuItem(name="Johnnie Walker Blue", description="Bottle. Premium blend.", price=6000, price_label="R6000", category="Whiskey", subcategory="Bottle", featured=True, tags=["premium"]),
            ],
        ),
        MenuCategory(
            name="Cognac",
            slug="cognac",
            description="Cognac bottle service.",
            items=[
                MenuItem(name="Hennessy VS", description="Bottle. Shot R40.", price=1100, price_label="R1100", category="Cognac", subcategory="Hennessy", featured=True),
                MenuItem(name="Hennessy VSOP", description="Bottle.", price=1800, price_label="R1800", category="Cognac", subcategory="Hennessy", tags=["premium"]),
                MenuItem(name="Hennessy XO", description="Bottle.", price=6000, price_label="R6000", category="Cognac", subcategory="Hennessy", tags=["premium"]),
                MenuItem(name="Martell VS", description="Bottle. Shot R40.", price=1100, price_label="R1100", category="Cognac", subcategory="Martell"),
                MenuItem(name="Martell Blue Swift", description="Bottle.", price=1800, price_label="R1800", category="Cognac", subcategory="Martell", tags=["premium"]),
                MenuItem(name="Courvoisier", description="Bottle.", price=1100, price_label="R1100", category="Cognac", subcategory="Courvoisier"),
                MenuItem(name="Remy Martin VS", description="Bottle. Shot R50.", price=1300, price_label="R1300", category="Cognac", subcategory="Remy Martin"),
                MenuItem(name="Remy Martin VSOP", description="Bottle.", price=2000, price_label="R2000", category="Cognac", subcategory="Remy Martin", tags=["premium"]),
                MenuItem(name="Remy Martin 1738", description="Bottle.", price=3200, price_label="R3200", category="Cognac", subcategory="Remy Martin", tags=["premium"]),
                MenuItem(name="Remy Martin XO", description="Bottle.", price=6500, price_label="R6500", category="Cognac", subcategory="Remy Martin", tags=["premium"]),
            ],
        ),
        MenuCategory(
            name="Liquor",
            slug="liquor",
            description="Herbal and specialty liquors.",
            items=[
                MenuItem(name="Jagermeister", description="Bottle. Shot R30.", price=650, price_label="R650", category="Liquor", subcategory="Bottle"),
            ],
        ),
        MenuCategory(
            name="Brandy",
            slug="brandy",
            description="Brandy bottle service.",
            items=[
                MenuItem(name="Richelieu", description="Bottle. Shot R20.", price=500, price_label="R500", category="Brandy", subcategory="Bottle"),
            ],
        ),
        MenuCategory(
            name="Shots",
            slug="shots",
            description="Shot specials.",
            items=[
                MenuItem(name="Jager Bomb", description="Comes in 2s.", price=70, price_label="R70", category="Shots", subcategory="Specials", featured=True),
            ],
        ),
        MenuCategory(
            name="Champagne",
            slug="champagne",
            description="Champagne and prestige bottles.",
            items=[
                MenuItem(name="Veuve Clicquot Yellow Label Brut", description="Bottle.", price=1500, price_label="R1500", category="Champagne", subcategory="Veuve Clicquot", featured=True),
                MenuItem(name="Veuve Clicquot Rich", description="Bottle.", price=1800, price_label="R1800", category="Champagne", subcategory="Veuve Clicquot", tags=["premium"]),
                MenuItem(name="Moet & Chandon Nectar Imperial", description="Bottle.", price=1800, price_label="R1800", category="Champagne", subcategory="Moet & Chandon", tags=["premium"]),
                MenuItem(name="G.H. Mumm", description="Bottle.", price=1400, price_label="R1400", category="Champagne", subcategory="Mumm"),
                MenuItem(name="Ace of Spades", description="Bottle. Ultra-premium.", price=8000, price_label="R8000", category="Champagne", subcategory="Armand de Brignac", featured=True, tags=["premium", "ultra"]),
            ],
        ),
        MenuCategory(
            name="Beers",
            slug="beers",
            description="Lagers and easy-pour bottles.",
            items=[
                MenuItem(name="Corona", description="Imported lager.", price=35, price_label="R35", category="Beers", subcategory="Lager"),
                MenuItem(name="Heineken", description="Premium lager.", price=30, price_label="R30", category="Beers", subcategory="Lager"),
                MenuItem(name="Castle Light", description="SA light lager.", price=30, price_label="R30", category="Beers", subcategory="Lager"),
                MenuItem(name="Carling Black Label", description="SA classic lager.", price=30, price_label="R30", category="Beers", subcategory="Lager"),
                MenuItem(name="Heineken Silver", description="Crisp light lager.", price=20, price_label="R20", category="Beers", subcategory="Lager"),
                MenuItem(name="Windhoek", description="Smooth Namibian lager.", price=35, price_label="R35", category="Beers", subcategory="Lager"),
            ],
        ),
        MenuCategory(
            name="Ciders",
            slug="ciders",
            description="Ciders and sparkling coolers.",
            items=[
                MenuItem(name="Ice Tropez", description="Sparkling cooler.", price=100, price_label="R100", category="Ciders", subcategory="Cooler", featured=True),
                MenuItem(name="Savannah", description="Crisp apple cider.", price=35, price_label="R35", category="Ciders", subcategory="Cider"),
                MenuItem(name="Bernini Blush", description="Light sparkling cider.", price=30, price_label="R30", category="Ciders", subcategory="Cider"),
                MenuItem(name="Other Ciders", description="Hunters, Strongbow, etc.", price=30, price_label="R30", category="Ciders", subcategory="Cider"),
            ],
        ),
        MenuCategory(
            name="Wines",
            slug="wines",
            description="Wines and rose.",
            items=[
                MenuItem(name="Chateau", description="House selection.", price=35, price_label="R35", category="Wines", subcategory="Wine"),
                MenuItem(name="Rupert & Rothschild", description="Premium red.", price=450, price_label="R450", category="Wines", subcategory="Wine", tags=["premium"]),
            ],
        ),
        MenuCategory(
            name="Refreshers",
            slug="refreshers",
            description="Soft drinks, waters, mixers, and energy drinks.",
            items=[
                MenuItem(name="Sparkling Water 500ml", description="Sparkling water.", price=20, price_label="R20.00", category="Refreshers", subcategory="Water"),
                MenuItem(name="Still Water 500ml", description="Still water.", price=20, price_label="R20.00", category="Refreshers", subcategory="Water"),
                MenuItem(name="Coke 200ml", description="Classic Coke.", price=20, price_label="R20.00", category="Refreshers", subcategory="Soft Drinks"),
                MenuItem(name="Sprite 300ml", description="Lemon-lime soda.", price=25, price_label="R25.00", category="Refreshers", subcategory="Soft Drinks"),
                MenuItem(name="Appletiser 1.25L", description="Sparkling apple juice.", price=70, price_label="R70.00", category="Refreshers", subcategory="Soft Drinks"),
                MenuItem(name="Redbull 250ml", description="Energy drink.", price=40, price_label="R40.00", category="Refreshers", subcategory="Energy"),
            ],
        ),
    ]

    promo_pool = PromoPool(
        name="Welcome Gold 20%",
        discount_type="percentage",
        discount_value=20,
        min_spend=1500,
        start_at=now - timedelta(days=1),
        end_at=now + timedelta(days=30),
        max_redemptions=1,
        audience="new-customers",
        active=True,
    )

    campaigns = [
        Campaign(subject="This Weekend at Vaal Vibes", audience="all-opted-in", body_html="<h1>This weekend</h1><p>Specials, events, and premium table requests.</p>", status="draft"),
        Campaign(subject="VIP Table Requests Open", audience="vip-segment", body_html="<h1>Request your booth</h1><p>Book premium tables for Champagne Saturday.</p>", status="mock-dispatched"),
    ]

    admin_users = [
        {
            "id": str(uuid.uuid4()),
            "name": "Super Admin",
            "email": "super@vaalvibes.app",
            "password_hash": hash_password("VaalVibes!123"),
            "role": "super",
            "demo_mfa_code": "246810",
            "created_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Marketing Admin",
            "email": "marketing@vaalvibes.app",
            "password_hash": hash_password("VaalVibes!123"),
            "role": "marketing",
            "demo_mfa_code": "246810",
            "created_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Promo Admin",
            "email": "promo@vaalvibes.app",
            "password_hash": hash_password("VaalVibes!123"),
            "role": "promo",
            "demo_mfa_code": "246810",
            "created_at": now,
        },
    ]

    demo_customer = None  # No demo customer seeded in live environment

    await db.menu_categories.insert_many([category.model_dump() for category in menu_categories])
    await db.promo_pools.insert_one(promo_pool.model_dump())
    await db.campaigns.insert_many([campaign.model_dump() for campaign in campaigns])
    await db.admin_users.insert_many(admin_users)
    await db.audit_logs.insert_one(
        AuditLogEntry(
            actor_id=admin_users[0]["id"],
            actor_role="super",
            action="seed",
            entity_type="system",
            entity_id="seed-data",
            summary="Seeded Vaal Vibes live environment data",
        ).model_dump()
    )


# Public routes
@api_router.get("/")
async def root() -> MessageResponse:
    return MessageResponse(message="Vaal Vibes API is live")


@api_router.get("/public/bootstrap", response_model=PublicBootstrapResponse)
async def get_public_bootstrap() -> PublicBootstrapResponse:
    menu = serialize_many(await db.menu_categories.find({}, {"_id": 0}).to_list(length=100))
    events = serialize_many(await db.events.find({"status": {"$ne": "archived"}}, {"_id": 0}).sort("date", 1).to_list(length=20))
    specials = serialize_many(await db.specials.find({"status": "active"}, {"_id": 0}).sort("available_until", 1).to_list(length=20))
    gallery = serialize_many(
        await db.gallery_photos.find({}, {"_id": 0})
        .sort([("sort_order", 1), ("created_at", -1)])
        .to_list(length=200)
    )
    return PublicBootstrapResponse(
        venue_name="Vaal Vibes",
        tagline="Nightlife, braai plates, and premium table vibes — all in one mobile-first experience.",
        logo_url=LOGO_URL,
        hero_image_url=BANNER_URL,
        menu=menu,
        events=events,
        specials=specials,
        venue_hours=[
            "Wed - Thu · 15:00 - 23:00",
            "Fri · 15:00 - 02:00",
            "Sat · 12:00 - 02:00",
            "Sun · 12:00 - 21:00",
        ],
        service_note="16 Fraser Street, Vanderbijlpark, Gauteng 1900",
        gallery=gallery,
    )


@api_router.get("/public/menu", response_model=List[MenuCategory])
async def get_menu() -> List[MenuCategory]:
    return serialize_many(await db.menu_categories.find({}, {"_id": 0}).to_list(length=100))


@api_router.get("/public/events", response_model=List[EventItem])
async def get_events() -> List[EventItem]:
    return serialize_many(await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(length=100))


@api_router.get("/public/specials", response_model=List[SpecialItem])
async def get_specials() -> List[SpecialItem]:
    return serialize_many(await db.specials.find({}, {"_id": 0}).sort("available_until", 1).to_list(length=100))


@api_router.get("/public/gallery", response_model=List[GalleryPhoto])
async def get_public_gallery() -> List[GalleryPhoto]:
    return serialize_many(
        await db.gallery_photos.find({}, {"_id": 0})
        .sort([("sort_order", 1), ("created_at", -1)])
        .to_list(length=200)
    )


@api_router.post("/public/birthday-requests", response_model=CustomerRequest)
async def create_birthday_request(payload: BirthdayBookingCreate) -> CustomerRequest:
    request_doc = CustomerRequest(
        reference_id=uuid.uuid4().hex[:8].upper(),
        user_id="guest-birthday",
        request_type="birthday-booking",
        date=payload.celebration_date,
        guest_count=payload.guest_count,
        notes=build_birthday_notes(payload),
        items=[],
        contact_phone=payload.phone,
        customer_name=payload.full_name,
        customer_email=payload.email,
        estimated_budget=payload.estimated_budget,
        arrival_time=payload.arrival_time,
        occasion="birthday",
        seating_preference=payload.seating_preference,
        date_of_birth=payload.date_of_birth,
        bottle_service=payload.bottle_service,
    )
    await db.requests.insert_one(request_doc.model_dump())
    return request_doc


# Customer auth and profile
@api_router.post("/auth/register", response_model=AuthResponse)
async def register_customer(payload: CustomerRegisterRequest) -> AuthResponse:
    email = payload.email.strip().lower()
    existing = await db.customers.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    customer = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": email,
        "phone": payload.phone,
        "password_hash": hash_password(payload.password),
        "dob": payload.dob,
        "preferences": payload.preferences.model_dump(),
        "created_at": now_utc(),
    }
    await db.customers.insert_one(customer)
    promo = await issue_welcome_promo(customer["id"])
    token = create_token(customer["id"], "customer", customer["name"], customer["email"])
    return AuthResponse(
        access_token=token,
        role="customer",
        user_id=customer["id"],
        name=customer["name"],
        email=customer["email"],
        promo=PromoInfo(percentage_discount=int(promo.discount_value), min_spend=promo.min_spend, expires_at=promo.expires_at),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login_customer(payload: CustomerLoginRequest) -> AuthResponse:
    email = payload.email.strip().lower()
    user = await db.customers.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user["email"] == "guest@vaalvibes.app":
        active_demo_promo = await db.promo_codes.find_one({"user_id": user["id"], "status": "active"}, {"_id": 0})
        if not active_demo_promo:
            await issue_welcome_promo(user["id"])
    token = create_token(user["id"], "customer", user["name"], user["email"])
    latest_promo = serialize(await db.promo_codes.find_one({"user_id": user["id"]}, {"_id": 0}, sort=[("issued_at", -1)]))
    promo = None
    if latest_promo:
        promo = PromoInfo(
            percentage_discount=int(latest_promo["discount_value"]),
            min_spend=latest_promo["min_spend"],
            expires_at=latest_promo["expires_at"],
        )
    return AuthResponse(
        access_token=token,
        role="customer",
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        promo=promo,
    )


@api_router.get("/auth/me", response_model=CustomerProfile)
async def get_customer_me(current_user: dict = Depends(get_current_customer)) -> CustomerProfile:
    return CustomerProfile(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user["phone"],
        dob=current_user.get("dob"),
        preferences=current_user.get("preferences", {}),
        created_at=current_user["created_at"],
    )


@api_router.get("/customer/wallet", response_model=List[PromoCode])
async def get_customer_wallet(current_user: dict = Depends(get_current_customer)) -> List[PromoCode]:
    promos = await db.promo_codes.find({"user_id": current_user["id"]}, {"_id": 0}).sort("issued_at", -1).to_list(length=100)
    return serialize_many(promos)


@api_router.get("/customer/profile", response_model=CustomerProfile)
async def get_customer_profile(current_user: dict = Depends(get_current_customer)) -> CustomerProfile:
    return CustomerProfile(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user["phone"],
        dob=current_user.get("dob"),
        preferences=current_user.get("preferences", {}),
        created_at=current_user["created_at"],
    )


@api_router.put("/customer/profile", response_model=CustomerProfile)
async def update_customer_profile(payload: CustomerRegisterRequest, current_user: dict = Depends(get_current_customer)) -> CustomerProfile:
    update_doc = {
        "name": payload.name,
        "phone": payload.phone,
        "dob": payload.dob,
        "preferences": payload.preferences.model_dump(),
    }
    if payload.password:
        update_doc["password_hash"] = hash_password(payload.password)
    await db.customers.update_one({"id": current_user["id"]}, {"$set": update_doc})
    updated = serialize(await db.customers.find_one({"id": current_user["id"]}, {"_id": 0}))
    return CustomerProfile(
        id=updated["id"],
        name=updated["name"],
        email=updated["email"],
        phone=updated["phone"],
        dob=updated.get("dob"),
        preferences=updated.get("preferences", {}),
        created_at=updated["created_at"],
    )


@api_router.post("/customer/requests", response_model=CustomerRequest)
async def create_customer_request(payload: CustomerRequestCreate, current_user: dict = Depends(get_current_customer)) -> CustomerRequest:
    request_doc = CustomerRequest(
        reference_id=uuid.uuid4().hex[:8].upper(),
        user_id=current_user["id"],
        request_type=payload.request_type,
        date=payload.date,
        guest_count=payload.guest_count,
        notes=payload.notes,
        items=payload.items,
        contact_phone=payload.contact_phone,
        customer_name=current_user.get("name"),
        customer_email=current_user.get("email"),
    )
    await db.requests.insert_one(request_doc.model_dump())
    return request_doc


@api_router.get("/customer/requests", response_model=List[CustomerRequest])
async def get_customer_requests(current_user: dict = Depends(get_current_customer)) -> List[CustomerRequest]:
    items = await db.requests.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return serialize_many(items)


# Admin auth and views
@api_router.post("/admin/auth/login", response_model=AuthResponse)
async def admin_login(payload: AdminLoginRequest) -> AuthResponse:
    email = payload.email.strip().lower()
    admin = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if payload.otp != admin["demo_mfa_code"]:
        raise HTTPException(status_code=401, detail="Invalid MFA code")
    token = create_token(admin["id"], admin["role"], admin["name"], admin["email"])
    return AuthResponse(
        access_token=token,
        role=admin["role"],
        user_id=admin["id"],
        name=admin["name"],
        email=admin["email"],
        demo_mfa_code=admin["demo_mfa_code"],
    )


@api_router.get("/admin/auth/me")
async def admin_me(current_admin: dict = Depends(get_current_admin)) -> dict:
    safe_admin = dict(current_admin)
    safe_admin.pop("password_hash", None)
    return safe_admin


@api_router.get("/admin/dashboard", response_model=DashboardResponse)
async def get_admin_dashboard(current_admin: dict = Depends(get_current_admin)) -> DashboardResponse:
    requests_today = await db.requests.count_documents({
        "created_at": {"$gte": now_utc().replace(hour=0, minute=0, second=0, microsecond=0)}
    })
    upcoming_events = await db.events.count_documents({"date": {"$gte": now_utc()}, "status": {"$ne": "archived"}})
    active_campaigns = await db.campaigns.count_documents({})
    redeemed_promos = await db.promo_codes.count_documents({"status": "redeemed"})
    recent_requests = serialize_many(await db.requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=5))
    redemptions = serialize_many(await db.redemption_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=30))

    redemption_series = {}
    for entry in redemptions:
        label = entry["created_at"].strftime("%d %b")
        redemption_series[label] = redemption_series.get(label, 0) + 1

    request_counts = {"reservation": 0, "order-intent": 0, "birthday-booking": 0}
    for item in recent_requests:
        request_counts[item["request_type"]] = request_counts.get(item["request_type"], 0) + 1

    return DashboardResponse(
        kpis=[
            DashboardKpi(label="Requests today", value=requests_today),
            DashboardKpi(label="Upcoming events", value=upcoming_events),
            DashboardKpi(label="Active campaigns", value=active_campaigns),
            DashboardKpi(label="Promos redeemed", value=redeemed_promos),
        ],
        redemptions_over_time=[DashboardSeriesPoint(name=name, value=value) for name, value in redemption_series.items()] or [DashboardSeriesPoint(name="No redemptions yet", value=0)],
        request_breakdown=[DashboardSeriesPoint(name=name, value=value) for name, value in request_counts.items()],
        recent_requests=recent_requests,
    )


@api_router.get("/admin/events", response_model=List[EventItem])
async def admin_list_events(current_admin: dict = Depends(get_current_admin)) -> List[EventItem]:
    return serialize_many(await db.events.find({}, {"_id": 0}).sort("date", 1).to_list(length=100))


@api_router.post("/admin/events", response_model=EventItem)
async def admin_create_event(payload: EventCreateRequest, current_admin: dict = Depends(get_current_admin)) -> EventItem:
    event = EventItem(**payload.model_dump())
    await db.events.insert_one(event.model_dump())
    await append_audit_log(current_admin, "create", "event", event.id, f"Created event {event.title}")
    return event


@api_router.put("/admin/events/{event_id}", response_model=EventItem)
async def admin_update_event(event_id: str, payload: EventCreateRequest, current_admin: dict = Depends(get_current_admin)) -> EventItem:
    await db.events.update_one({"id": event_id}, {"$set": payload.model_dump()})
    updated = serialize(await db.events.find_one({"id": event_id}, {"_id": 0}))
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    await append_audit_log(current_admin, "update", "event", event_id, f"Updated event {updated['title']}")
    return updated


@api_router.delete("/admin/events/{event_id}", response_model=MessageResponse)
async def admin_delete_event(event_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    event = serialize(await db.events.find_one({"id": event_id}, {"_id": 0}))
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.events.delete_one({"id": event_id})
    await append_audit_log(current_admin, "delete", "event", event_id, f"Deleted event {event['title']}")
    return MessageResponse(message="Event deleted")


@api_router.get("/admin/specials", response_model=List[SpecialItem])
async def admin_list_specials(current_admin: dict = Depends(get_current_admin)) -> List[SpecialItem]:
    return serialize_many(await db.specials.find({}, {"_id": 0}).sort("available_until", 1).to_list(length=100))


@api_router.post("/admin/specials", response_model=SpecialItem)
async def admin_create_special(payload: SpecialCreateRequest, current_admin: dict = Depends(get_current_admin)) -> SpecialItem:
    special = SpecialItem(**payload.model_dump())
    await db.specials.insert_one(special.model_dump())
    await append_audit_log(current_admin, "create", "special", special.id, f"Created special {special.title}")
    return special


@api_router.put("/admin/specials/{special_id}", response_model=SpecialItem)
async def admin_update_special(special_id: str, payload: SpecialCreateRequest, current_admin: dict = Depends(get_current_admin)) -> SpecialItem:
    await db.specials.update_one({"id": special_id}, {"$set": payload.model_dump()})
    updated = serialize(await db.specials.find_one({"id": special_id}, {"_id": 0}))
    if not updated:
        raise HTTPException(status_code=404, detail="Special not found")
    await append_audit_log(current_admin, "update", "special", special_id, f"Updated special {updated['title']}")
    return updated


@api_router.delete("/admin/specials/{special_id}", response_model=MessageResponse)
async def admin_delete_special(special_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    special = serialize(await db.specials.find_one({"id": special_id}, {"_id": 0}))
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    await db.specials.delete_one({"id": special_id})
    await append_audit_log(current_admin, "delete", "special", special_id, f"Deleted special {special['title']}")
    return MessageResponse(message="Special deleted")


@api_router.get("/admin/menu/categories", response_model=List[MenuCategory])
async def admin_list_menu_categories(current_admin: dict = Depends(get_current_admin)) -> List[MenuCategory]:
    return serialize_many(await db.menu_categories.find({}, {"_id": 0}).sort("name", 1).to_list(length=200))


@api_router.post("/admin/menu/categories", response_model=MenuCategory)
async def admin_create_menu_category(payload: MenuCategoryCreateRequest, current_admin: dict = Depends(get_current_admin)) -> MenuCategory:
    existing = await db.menu_categories.find_one({"slug": payload.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="Menu category slug already exists")
    category = MenuCategory(**payload.model_dump(), items=[])
    await db.menu_categories.insert_one(category.model_dump())
    await append_audit_log(current_admin, "create", "menu-category", category.id, f"Created menu category {category.name}")
    return category


@api_router.put("/admin/menu/categories/{category_id}", response_model=MenuCategory)
async def admin_update_menu_category(category_id: str, payload: MenuCategoryCreateRequest, current_admin: dict = Depends(get_current_admin)) -> MenuCategory:
    existing = await db.menu_categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Menu category not found")
    await db.menu_categories.update_one(
        {"id": category_id},
        {"$set": {"name": payload.name, "slug": payload.slug, "description": payload.description}},
    )
    updated = serialize(await db.menu_categories.find_one({"id": category_id}, {"_id": 0}))
    if not updated:
        raise HTTPException(status_code=404, detail="Menu category not found")
    await append_audit_log(current_admin, "update", "menu-category", category_id, f"Updated menu category {updated['name']}")
    return updated


@api_router.delete("/admin/menu/categories/{category_id}", response_model=MessageResponse)
async def admin_delete_menu_category(category_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    category = serialize(await db.menu_categories.find_one({"id": category_id}, {"_id": 0}))
    if not category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    await db.menu_categories.delete_one({"id": category_id})
    await append_audit_log(current_admin, "delete", "menu-category", category_id, f"Deleted menu category {category['name']}")
    return MessageResponse(message="Menu category deleted")


@api_router.post("/admin/menu/categories/{category_id}/items", response_model=MenuItem)
async def admin_create_menu_item(category_id: str, payload: MenuItemCreateRequest, current_admin: dict = Depends(get_current_admin)) -> MenuItem:
    category = await db.menu_categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Menu category not found")
    data = payload.model_dump()
    if not data.get("category"):
        data["category"] = category["name"]
    item = MenuItem(**data)
    await db.menu_categories.update_one(
        {"id": category_id},
        {"$push": {"items": item.model_dump()}},
    )
    await append_audit_log(current_admin, "create", "menu-item", item.id, f"Created menu item {item.name}")
    return item


@api_router.put("/admin/menu/items/{item_id}", response_model=MenuItem)
async def admin_update_menu_item(item_id: str, payload: MenuItemCreateRequest, current_admin: dict = Depends(get_current_admin)) -> MenuItem:
    existing = await db.menu_categories.find_one({"items.id": item_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Menu item not found")
    update_fields = {f"items.$.{key}": value for key, value in payload.model_dump().items()}
    await db.menu_categories.update_one(
        {"items.id": item_id},
        {"$set": update_fields},
    )
    refreshed = await db.menu_categories.find_one({"items.id": item_id}, {"_id": 0})
    if not refreshed:
        raise HTTPException(status_code=404, detail="Menu item not found")
    updated_item = next((it for it in refreshed.get("items", []) if it.get("id") == item_id), None)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await append_audit_log(current_admin, "update", "menu-item", item_id, f"Updated menu item {updated_item['name']}")
    return updated_item


@api_router.delete("/admin/menu/items/{item_id}", response_model=MessageResponse)
async def admin_delete_menu_item(item_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    existing = await db.menu_categories.find_one({"items.id": item_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Menu item not found")
    item = next((it for it in existing.get("items", []) if it.get("id") == item_id), None)
    item_name = item["name"] if item else item_id
    await db.menu_categories.update_one(
        {"items.id": item_id},
        {"$pull": {"items": {"id": item_id}}},
    )
    await append_audit_log(current_admin, "delete", "menu-item", item_id, f"Deleted menu item {item_name}")
    return MessageResponse(message="Menu item deleted")


@api_router.get("/admin/gallery", response_model=List[GalleryPhoto])
async def admin_list_gallery(current_admin: dict = Depends(get_current_admin)) -> List[GalleryPhoto]:
    return serialize_many(
        await db.gallery_photos.find({}, {"_id": 0})
        .sort([("sort_order", 1), ("created_at", -1)])
        .to_list(length=500)
    )


@api_router.post("/admin/gallery", response_model=GalleryPhoto)
async def admin_create_gallery_photo(payload: GalleryPhotoCreateRequest, current_admin: dict = Depends(get_current_admin)) -> GalleryPhoto:
    drive_file_id = extract_drive_id(payload.url_or_id)
    photo = GalleryPhoto(
        drive_file_id=drive_file_id,
        caption=payload.caption,
        sort_order=payload.sort_order,
        added_by=current_admin["id"],
    )
    await db.gallery_photos.insert_one(photo.model_dump())
    await append_audit_log(current_admin, "create", "gallery-photo", photo.id, f"Added gallery photo {photo.drive_file_id}")
    return photo


@api_router.post("/admin/gallery/bulk", response_model=GalleryBulkResult)
async def admin_bulk_create_gallery_photos(
    payload: GalleryBulkCreateRequest,
    current_admin: dict = Depends(get_current_admin),
) -> GalleryBulkResult:
    parts = [p.strip() for p in re.split(r"[,\n\r\t]+", payload.text) if p.strip()]
    if not parts:
        raise HTTPException(status_code=400, detail="No URLs or file IDs provided")

    existing_ids: set[str] = set()
    async for doc in db.gallery_photos.find({}, {"_id": 0, "drive_file_id": 1}):
        existing_ids.add(doc["drive_file_id"])

    last_doc = await db.gallery_photos.find_one(
        {}, {"_id": 0, "sort_order": 1}, sort=[("sort_order", -1)]
    )
    next_sort_order = (last_doc.get("sort_order", 0) if last_doc else 0) + 1

    seen_in_payload: set[str] = set()
    new_photos: list[GalleryPhoto] = []
    skipped = 0
    failed = 0
    errors: list[str] = []

    for part in parts:
        try:
            file_id = extract_drive_id(part)
        except HTTPException:
            failed += 1
            preview = part if len(part) <= 60 else part[:57] + "..."
            errors.append(f"Could not parse: {preview}")
            continue

        if file_id in seen_in_payload or file_id in existing_ids:
            skipped += 1
            continue

        seen_in_payload.add(file_id)
        photo = GalleryPhoto(
            drive_file_id=file_id,
            caption="",
            sort_order=next_sort_order,
            added_by=current_admin["id"],
        )
        next_sort_order += 1
        new_photos.append(photo)

    if new_photos:
        await db.gallery_photos.insert_many([photo.model_dump() for photo in new_photos])
        await append_audit_log(
            current_admin,
            "create",
            "gallery-photo",
            "bulk",
            f"Bulk-added {len(new_photos)} gallery photos ({skipped} duplicates, {failed} unparseable)",
        )

    return GalleryBulkResult(
        added=len(new_photos),
        skipped_duplicates=skipped,
        failed=failed,
        errors=errors,
        photos=new_photos,
    )


@api_router.put("/admin/gallery/{photo_id}", response_model=GalleryPhoto)
async def admin_update_gallery_photo(photo_id: str, payload: GalleryPhotoUpdateRequest, current_admin: dict = Depends(get_current_admin)) -> GalleryPhoto:
    existing = await db.gallery_photos.find_one({"id": photo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Gallery photo not found")
    await db.gallery_photos.update_one(
        {"id": photo_id},
        {"$set": {"caption": payload.caption, "sort_order": payload.sort_order}},
    )
    updated = serialize(await db.gallery_photos.find_one({"id": photo_id}, {"_id": 0}))
    if not updated:
        raise HTTPException(status_code=404, detail="Gallery photo not found")
    await append_audit_log(current_admin, "update", "gallery-photo", photo_id, f"Updated gallery photo {updated['drive_file_id']}")
    return updated


@api_router.delete("/admin/gallery/{photo_id}", response_model=MessageResponse)
async def admin_delete_gallery_photo(photo_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    photo = serialize(await db.gallery_photos.find_one({"id": photo_id}, {"_id": 0}))
    if not photo:
        raise HTTPException(status_code=404, detail="Gallery photo not found")
    await db.gallery_photos.delete_one({"id": photo_id})
    await append_audit_log(current_admin, "delete", "gallery-photo", photo_id, f"Deleted gallery photo {photo['drive_file_id']}")
    return MessageResponse(message="Gallery photo deleted")


@api_router.get("/admin/campaigns", response_model=List[Campaign])
async def admin_list_campaigns(current_admin: dict = Depends(get_current_admin)) -> List[Campaign]:
    return serialize_many(await db.campaigns.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100))


@api_router.post("/admin/campaigns", response_model=Campaign)
async def admin_create_campaign(payload: CampaignCreateRequest, current_admin: dict = Depends(get_current_admin)) -> Campaign:
    campaign = Campaign(**payload.model_dump())
    await db.campaigns.insert_one(campaign.model_dump())
    await append_audit_log(current_admin, "create", "campaign", campaign.id, f"Created campaign {campaign.subject}")
    return campaign


@api_router.post("/admin/campaigns/{campaign_id}/dispatch", response_model=MessageResponse)
async def admin_dispatch_campaign(campaign_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    dispatch_logger = logging.getLogger(__name__)
    campaign = serialize(await db.campaigns.find_one({"id": campaign_id}, {"_id": 0}))
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    recipients = await db.customers.find(
        {"preferences.marketing_opt_in": True},
        {"_id": 0, "email": 1, "name": 1, "id": 1},
    ).to_list(length=10000)
    recipient_count = len(recipients)

    if not RESEND_API_KEY:
        await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": "mock-dispatched"}})
        await append_audit_log(
            current_admin,
            "dispatch",
            "campaign",
            campaign_id,
            f"Mock dispatch (RESEND_API_KEY not configured) — would have sent to {recipient_count} recipients",
        )
        return MessageResponse(
            message=f"RESEND_API_KEY not configured — campaign marked as mock-dispatched ({recipient_count} recipients)."
        )

    await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": "sending"}})

    sent_count = 0
    failed_count = 0
    for recipient in recipients:
        email = recipient.get("email")
        if not email:
            failed_count += 1
            continue
        try:
            resend.Emails.send(
                {
                    "from": RESEND_FROM_EMAIL,
                    "to": [email],
                    "subject": campaign["subject"],
                    "html": campaign["body_html"],
                }
            )
            sent_count += 1
        except Exception as exc:  # noqa: BLE001 — third-party SDK raises a variety of errors
            failed_count += 1
            dispatch_logger.warning("Resend send failed for %s: %s", email, exc)

    if sent_count > 0 and failed_count == 0:
        final_status = "sent"
    elif sent_count > 0 and failed_count > 0:
        final_status = "partial"
    else:
        final_status = "failed"

    await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": final_status}})
    await append_audit_log(
        current_admin,
        "dispatch",
        "campaign",
        campaign_id,
        f"Dispatched campaign '{campaign['subject']}' — {sent_count} sent, {failed_count} failed",
    )
    return MessageResponse(message=f"Campaign dispatched: {sent_count} sent, {failed_count} failed.")


@api_router.get("/admin/promo-pools", response_model=List[PromoPool])
async def admin_list_promo_pools(current_admin: dict = Depends(get_current_admin)) -> List[PromoPool]:
    return serialize_many(await db.promo_pools.find({}, {"_id": 0}).sort("start_at", -1).to_list(length=100))


@api_router.post("/admin/promo-pools", response_model=PromoPool)
async def admin_create_promo_pool(payload: PromoPoolCreateRequest, current_admin: dict = Depends(get_current_admin)) -> PromoPool:
    if payload.active:
        await db.promo_pools.update_many({}, {"$set": {"active": False}})
    pool = PromoPool(**payload.model_dump())
    await db.promo_pools.insert_one(pool.model_dump())
    await append_audit_log(current_admin, "create", "promo-pool", pool.id, f"Created promo pool {pool.name}")
    return pool


@api_router.put("/admin/promo-pools/{pool_id}", response_model=PromoPool)
async def admin_update_promo_pool(pool_id: str, payload: PromoPoolCreateRequest, current_admin: dict = Depends(get_current_admin)) -> PromoPool:
    if payload.active:
        await db.promo_pools.update_many({}, {"$set": {"active": False}})
    await db.promo_pools.update_one({"id": pool_id}, {"$set": payload.model_dump()})
    updated = serialize(await db.promo_pools.find_one({"id": pool_id}, {"_id": 0}))
    if not updated:
        raise HTTPException(status_code=404, detail="Promo pool not found")
    await append_audit_log(current_admin, "update", "promo-pool", pool_id, f"Updated promo pool {updated['name']}")
    return updated


@api_router.get("/admin/requests", response_model=List[CustomerRequest])
async def admin_list_requests(current_admin: dict = Depends(get_current_admin)) -> List[CustomerRequest]:
    return serialize_many(await db.requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100))


@api_router.get("/admin/users", response_model=List[CustomerSummary])
async def admin_list_users(current_admin: dict = Depends(get_current_admin)) -> List[CustomerSummary]:
    users = serialize_many(await db.customers.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100))
    return [
        CustomerSummary(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            phone=user["phone"],
            created_at=user["created_at"],
            marketing_opt_in=user.get("preferences", {}).get("marketing_opt_in", True),
        )
        for user in users
    ]


@api_router.get("/admin/audit-logs", response_model=List[AuditLogEntry])
async def admin_list_audit_logs(current_admin: dict = Depends(get_current_admin)) -> List[AuditLogEntry]:
    return serialize_many(await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=200))


@api_router.post("/admin/promo/validate", response_model=PromoValidationResponse)
async def admin_validate_promo(payload: PromoValidationRequest, current_admin: dict = Depends(get_current_admin)) -> PromoValidationResponse:
    result = await validate_promo_logic(payload.code, payload.bill_amount)
    await db.redemption_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "promo_id": result.promo_id,
            "code": result.code,
            "bill_amount": payload.bill_amount,
            "status": result.status,
            "reason": result.reason,
            "created_at": now_utc(),
            "admin_id": current_admin["id"],
            "action": "validate",
        }
    )
    await append_audit_log(current_admin, "validate", "promo", result.promo_id or result.code, result.reason)
    return result


@api_router.post("/admin/promo/redeem", response_model=PromoValidationResponse)
async def admin_redeem_promo(payload: PromoValidationRequest, current_admin: dict = Depends(get_current_admin)) -> PromoValidationResponse:
    result = await validate_promo_logic(payload.code, payload.bill_amount)
    if not result.approved or not result.promo_id:
        await db.redemption_logs.insert_one(
            {
                "id": str(uuid.uuid4()),
                "promo_id": result.promo_id,
                "code": result.code,
                "bill_amount": payload.bill_amount,
                "status": result.status,
                "reason": result.reason,
                "created_at": now_utc(),
                "admin_id": current_admin["id"],
                "action": "redeem-rejected",
            }
        )
        return result

    update = await db.promo_codes.update_one(
        {"id": result.promo_id, "status": "active"},
        {"$set": {"status": "redeemed", "redeemed_at": now_utc()}, "$inc": {"redemption_count": 1}},
    )
    if update.modified_count == 0:
        raise HTTPException(status_code=409, detail="Promo could not be redeemed")

    await db.redemption_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "promo_id": result.promo_id,
            "code": result.code,
            "bill_amount": payload.bill_amount,
            "status": "redeemed",
            "reason": "Promo redeemed successfully",
            "created_at": now_utc(),
            "admin_id": current_admin["id"],
            "action": "redeem",
        }
    )
    await append_audit_log(current_admin, "redeem", "promo", result.promo_id, f"Redeemed promo {result.code}")
    return PromoValidationResponse(
        approved=True,
        code=result.code,
        reason="Promo redeemed successfully",
        discount_amount=result.discount_amount,
        status="redeemed",
        min_spend=result.min_spend,
        bill_amount=result.bill_amount,
        promo_id=result.promo_id,
        expires_at=result.expires_at,
    )


@api_router.post("/admin/promo/revoke/{promo_id}", response_model=MessageResponse)
async def admin_revoke_promo(promo_id: str, current_admin: dict = Depends(get_current_admin)) -> MessageResponse:
    promo = serialize(await db.promo_codes.find_one({"id": promo_id}, {"_id": 0}))
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    await db.promo_codes.update_one({"id": promo_id}, {"$set": {"status": "revoked"}})
    await append_audit_log(current_admin, "revoke", "promo", promo_id, f"Revoked promo {promo['code']}")
    return MessageResponse(message="Promo revoked")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_tasks() -> None:
    await seed_database()
    await repair_promo_signatures()
    await ensure_demo_customer_active_promo()
    logger.info("Vaal Vibes API startup complete")


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
