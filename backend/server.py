from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = 'HS256'
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


def create_token() -> str:
    payload = {
        "sub": "admin",
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    if not creds:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Token inválido")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sessão expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ---------- Models ----------

class LoginIn(BaseModel):
    password: str

class ServiceIn(BaseModel):
    name: str
    description: str
    price: float
    duration_minutes: int = 60
    image: str = ""

class WorkDayIn(BaseModel):
    active: bool
    opening_time: str = "09:00"
    closing_time: str = "18:00"

class BlockedSlotIn(BaseModel):
    date: str
    time: Optional[str] = None

class AppointmentIn(BaseModel):
    name: str
    phone: str
    service: str
    date: str
    time: str

class AppointmentStatusIn(BaseModel):
    status: str


# ---------- Auth ----------

@api_router.post("/auth/login")
async def login(body: LoginIn):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha incorreta")
    return {"token": create_token()}

@api_router.get("/auth/check")
async def check_auth(admin=Depends(require_admin)):
    return {"ok": True}


# ---------- Services ----------

@api_router.get("/services")
async def list_services():
    return await db.services.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)

@api_router.post("/services", status_code=201)
async def create_service(body: ServiceIn, admin=Depends(require_admin)):
    max_order = await db.services.find_one(sort=[("sort_order", -1)])
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["sort_order"] = (max_order["sort_order"] + 1) if max_order else 1
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/services/{service_id}")
async def update_service(service_id: str, body: ServiceIn, admin=Depends(require_admin)):
    result = await db.services.update_one({"id": service_id}, {"$set": body.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return await db.services.find_one({"id": service_id}, {"_id": 0})

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, admin=Depends(require_admin)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"ok": True}

@api_router.put("/services/{service_id}/order")
async def set_service_order(service_id: str, body: dict, admin=Depends(require_admin)):
    await db.services.update_one({"id": service_id}, {"$set": {"sort_order": body.get("sort_order", 0)}})
    return {"ok": True}


# ---------- Work days ----------

@api_router.get("/work-days")
async def list_work_days():
    return await db.work_days.find({}, {"_id": 0}).sort("day", 1).to_list(7)

@api_router.put("/work-days/{day}")
async def update_work_day(day: int, body: WorkDayIn, admin=Depends(require_admin)):
    if day < 0 or day > 6:
        raise HTTPException(status_code=400, detail="Dia inválido")
    if body.active and body.opening_time >= body.closing_time:
        raise HTTPException(status_code=400, detail="O último horário precisa ser depois do primeiro")
    await db.work_days.update_one({"day": day}, {"$set": body.model_dump()}, upsert=True)
    return await db.work_days.find_one({"day": day}, {"_id": 0})


# ---------- Blocked slots ----------

@api_router.get("/blocked-slots")
async def list_blocked_slots():
    return await db.blocked_slots.find({}, {"_id": 0}).sort("date", 1).to_list(1000)

@api_router.post("/blocked-slots", status_code=201)
async def create_blocked_slot(body: BlockedSlotIn, admin=Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.blocked_slots.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/blocked-slots/{slot_id}")
async def delete_blocked_slot(slot_id: str, admin=Depends(require_admin)):
    await db.blocked_slots.delete_one({"id": slot_id})
    return {"ok": True}


# ---------- Appointments ----------

@api_router.get("/appointments/booked")
async def booked_slots():
    cursor = db.appointments.find(
        {"status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0, "date": 1, "time": 1},
    )
    return await cursor.to_list(5000)

@api_router.get("/appointments")
async def list_appointments(admin=Depends(require_admin)):
    return await db.appointments.find({}, {"_id": 0}).sort("date", 1).to_list(5000)

@api_router.post("/appointments", status_code=201)
async def create_appointment(body: AppointmentIn):
    existing = await db.appointments.find_one({
        "date": body.date,
        "time": body.time,
        "status": {"$in": ["pending", "confirmed"]},
    })
    if existing:
        raise HTTPException(status_code=409, detail="Horário já reservado")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.appointments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, body: AppointmentStatusIn, admin=Depends(require_admin)):
    if body.status not in ("pending", "confirmed", "cancelled"):
        raise HTTPException(status_code=400, detail="Status inválido")
    result = await db.appointments.update_one({"id": appointment_id}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return await db.appointments.find_one({"id": appointment_id}, {"_id": 0})


# ---------- Seed ----------

DEFAULT_SERVICES = [
    {
        "name": "Unhas de Gel",
        "description": "Alongamento em gel com acabamento natural e brilho duradouro. Ideal para quem busca unhas resistentes e elegantes por semanas.",
        "price": 120, "duration_minutes": 120, "image": "/images/services/gel.jpg", "sort_order": 1,
    },
    {
        "name": "Fibra de Vidro",
        "description": "Técnica de alongamento com fios de fibra de vidro, leve e resistente, perfeita para unhas com aspecto natural.",
        "price": 150, "duration_minutes": 150, "image": "/images/services/fibra.jpg", "sort_order": 2,
    },
    {
        "name": "Molde F1",
        "description": "Alongamento esculpido no molde F1, que valoriza o formato natural das suas unhas com curvatura perfeita.",
        "price": 130, "duration_minutes": 120, "image": "/images/services/molde.jpg", "sort_order": 3,
    },
    {
        "name": "Banho de Gel",
        "description": "Camada de gel sobre a unha natural para fortalecer, proteger e dar brilho intenso sem alongamento.",
        "price": 90, "duration_minutes": 90, "image": "/images/services/banho.jpg", "sort_order": 4,
    },
    {
        "name": "Gel na Tips",
        "description": "Alongamento com tips e gel, prático e com resultado impecável, no comprimento e formato que você desejar.",
        "price": 140, "duration_minutes": 120, "image": "/images/services/tips.jpg", "sort_order": 5,
    },
]

DEFAULT_WORK_DAYS = [
    {"day": 0, "active": True, "opening_time": "10:00", "closing_time": "16:00"},
    {"day": 1, "active": False, "opening_time": "09:00", "closing_time": "18:00"},
    {"day": 2, "active": False, "opening_time": "09:00", "closing_time": "18:00"},
    {"day": 3, "active": True, "opening_time": "14:00", "closing_time": "18:00"},
    {"day": 4, "active": False, "opening_time": "09:00", "closing_time": "18:00"},
    {"day": 5, "active": True, "opening_time": "14:00", "closing_time": "19:00"},
    {"day": 6, "active": True, "opening_time": "10:00", "closing_time": "18:00"},
]


@app.on_event("startup")
async def seed_data():
    if await db.services.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = [{**s, "id": str(uuid.uuid4()), "created_at": now} for s in DEFAULT_SERVICES]
        await db.services.insert_many(docs)
    if await db.work_days.count_documents({}) == 0:
        now = datetime.now(timezone.utc).isoformat()
        docs = [{**w, "id": str(uuid.uuid4()), "created_at": now} for w in DEFAULT_WORK_DAYS]
        await db.work_days.insert_many(docs)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
