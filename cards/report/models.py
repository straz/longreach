from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr


# --- Taxonomy models ---

class TaxonomyCategory(BaseModel):
    name: str
    description: str
    code: str


class TaxonomyCondition(BaseModel):
    code: str
    name: str
    category: str
    short_description: str
    full_description: str
    vectors: list[str]
    signs_and_symptoms: str
    diagnostic_tests: str
    therapies_and_prevention: str
    quality: int
    image: str


# To add a new version later, the only changes needed are in models.py:
#  1. Define TaxonomyV2 (with whatever new/changed fields it has)
#  2. Add "0002": TaxonomyV2 to TAXONOMY_MODELS
#  3. Update the Taxonomy union: Taxonomy = TaxonomyV1 | TaxonomyV2

class TaxonomyV1(BaseModel):
    """Taxonomy schema for version '0001'."""
    taxonomy_name: str
    version: str
    description: str
    infection_vectors: list[str]
    categories: list[TaxonomyCategory]
    conditions: list[TaxonomyCondition]


# Union of all known taxonomy versions. Extend as new versions are added:
#   Taxonomy = TaxonomyV1 | TaxonomyV2
Taxonomy = TaxonomyV1

# Registry mapping taxonomy_version strings to their model class.
TAXONOMY_MODELS: dict[str, type[Taxonomy]] = {
    "0001": TaxonomyV1,
}


# --- Card models ---

class SelectedCard(BaseModel):
    id: str
    name: str


class EnrichedCard(BaseModel):
    id: str
    name: str
    code: str
    category: str
    short_description: str
    full_description: str
    vectors: list[str]


# --- Leads table ---

LeadStatus = Literal['new', 'contacted', 'qualified', 'converted', 'archived']


class Lead(BaseModel):
    id: int
    created_at: datetime
    name: str
    email: EmailStr
    title: str | None = None
    organization: str | None = None
    comments: str | None = None
    selected_cards: list[SelectedCard] | None = None
    ai_characteristics: list[str] | None = None
    ai_characteristics_other: str | None = None
    ai_providers: list[str] | None = None
    ai_providers_other: str | None = None
    concern_level: int | None = None
    who_concerned: list[str] | None = None
    who_concerned_other: str | None = None
    status: LeadStatus = 'new'
    converted_to_contact_id: int | None = None
    lid: str
    campaign: str | None = None
    taxonomy_version: str | None = None


# --- Webhook payload models ---

class LeadRecord(BaseModel):
    """Minimal lead fields carried in the Supabase INSERT webhook."""
    name: str
    email: EmailStr
    lid: str

    model_config = {"extra": "ignore"}


class InsertLeadNotification(BaseModel):
    """
    Supabase sends this to Modal when an insert happens in the leads database
    """
    type: str
    table: str
    record: LeadRecord
    schema_: str | None = None
    old_record: dict | None = None

    model_config = {"extra": "ignore", "populate_by_name": True}


# --- API response models ---

class ReportResponse(BaseModel):
    success: bool
    report: str | None = None
    error: str | None = None
