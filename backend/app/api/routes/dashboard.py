from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from typing import List

from app.db.session import get_db
from app.models.models import User, Task, Project, ProjectMember, TaskStatus, UserRole
from app.schemas.schemas import DashboardStats, TaskStatusCount, UserTaskCount, TaskOut, UserShort
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get user's projects
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    is_admin_in = [m.project_id for m in memberships if m.role == UserRole.ADMIN]

    # Base task query - admins see all tasks in their projects, members see assigned
    if is_admin_in:
        admin_tasks = db.query(Task).filter(Task.project_id.in_(is_admin_in))
    else:
        admin_tasks = db.query(Task).filter(Task.id == -1)  # empty

    member_only_projects = [pid for pid in project_ids if pid not in is_admin_in]
    if member_only_projects:
        member_tasks = db.query(Task).filter(
            Task.project_id.in_(member_only_projects),
            Task.assignee_id == current_user.id
        )
    else:
        member_tasks = db.query(Task).filter(Task.id == -1)  # empty

    all_tasks = admin_tasks.union(member_tasks).all()
    task_ids = [t.id for t in all_tasks]

    # Fetch full task objects (union gives partial)
    tasks = db.query(Task).filter(Task.id.in_(task_ids)).all() if task_ids else []

    total_tasks = len(tasks)
    now = datetime.now(timezone.utc)

    todo_count = sum(1 for t in tasks if t.status == TaskStatus.TODO)
    in_progress_count = sum(1 for t in tasks if t.status == TaskStatus.IN_PROGRESS)
    done_count = sum(1 for t in tasks if t.status == TaskStatus.DONE)
    overdue_count = sum(1 for t in tasks if t.due_date and t.due_date.replace(tzinfo=timezone.utc) < now and t.status != TaskStatus.DONE)

    # Tasks per user (for admin projects only)
    tasks_per_user = []
    if task_ids:
        user_task_counts = db.query(
            Task.assignee_id, func.count(Task.id).label("count")
        ).filter(
            Task.id.in_(task_ids),
            Task.assignee_id.isnot(None)
        ).group_by(Task.assignee_id).all()

        for user_id, count in user_task_counts:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                tasks_per_user.append(UserTaskCount(
                    user=UserShort(id=user.id, name=user.name, email=user.email),
                    count=count
                ))

    recent_tasks = sorted(tasks, key=lambda t: t.created_at, reverse=True)[:5]

    return DashboardStats(
        total_tasks=total_tasks,
        tasks_by_status=TaskStatusCount(todo=todo_count, in_progress=in_progress_count, done=done_count),
        overdue_tasks=overdue_count,
        tasks_per_user=tasks_per_user,
        recent_tasks=recent_tasks,
        total_projects=len(project_ids),
        total_members=len(set(
            m.user_id
            for pid in project_ids
            for m in db.query(ProjectMember).filter(ProjectMember.project_id == pid).all()
        ))
    )
