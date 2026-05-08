from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, TaskStatus, TaskPriority


# ─── User Schemas ───────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserShort(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Project Schemas ─────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class ProjectMemberOut(BaseModel):
    id: int
    user: UserShort
    role: UserRole
    joined_at: datetime

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    creator: UserShort
    members: List[ProjectMemberOut]
    created_at: datetime
    task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    email: str
    role: UserRole = UserRole.MEMBER


class UpdateMemberRole(BaseModel):
    role: UserRole


# ─── Task Schemas ─────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime]
    project_id: int
    assignee: Optional[UserShort]
    creator: UserShort
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ────────────────────────────────────────────────────────────

class TaskStatusCount(BaseModel):
    todo: int
    in_progress: int
    done: int


class UserTaskCount(BaseModel):
    user: UserShort
    count: int


class DashboardStats(BaseModel):
    total_tasks: int
    tasks_by_status: TaskStatusCount
    overdue_tasks: int
    tasks_per_user: List[UserTaskCount]
    recent_tasks: List[TaskOut]
    total_projects: int
    total_members: int
