from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.models import User, Task, ProjectMember, UserRole, Project
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut
from app.api.deps import get_current_user, get_project_member, require_project_admin

router = APIRouter()


@router.post("/projects/{project_id}/tasks", response_model=TaskOut, status_code=201)
def create_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = get_project_member(project_id, current_user, db)

    # Only admins can create tasks
    if membership.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create tasks")

    # Validate assignee is project member
    if task_in.assignee_id:
        assignee_membership = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == task_in.assignee_id
        ).first()
        if not assignee_membership:
            raise HTTPException(status_code=400, detail="Assignee must be a project member")

    task = Task(
        **task_in.model_dump(),
        project_id=project_id,
        creator_id=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/projects/{project_id}/tasks", response_model=List[TaskOut])
def list_tasks(
    project_id: int,
    status: Optional[str] = None,
    assignee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = get_project_member(project_id, current_user, db)
    query = db.query(Task).filter(Task.project_id == project_id)

    # Members can only see their own tasks
    if membership.role == UserRole.MEMBER:
        query = query.filter(Task.assignee_id == current_user.id)
    else:
        if assignee_id:
            query = query.filter(Task.assignee_id == assignee_id)

    if status:
        query = query.filter(Task.status == status)

    return query.order_by(Task.created_at.desc()).all()


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    membership = get_project_member(task.project_id, current_user, db)

    if membership.role == UserRole.MEMBER and task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return task


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    membership = get_project_member(task.project_id, current_user, db)

    # Members can only update status of their own tasks
    if membership.role == UserRole.MEMBER:
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only update your assigned tasks")
        allowed = {"status"}
        update_data = {k: v for k, v in task_in.model_dump(exclude_none=True).items() if k in allowed}
    else:
        update_data = task_in.model_dump(exclude_none=True)
        # Validate new assignee if changing
        if "assignee_id" in update_data and update_data["assignee_id"]:
            assignee_membership = db.query(ProjectMember).filter(
                ProjectMember.project_id == task.project_id,
                ProjectMember.user_id == update_data["assignee_id"]
            ).first()
            if not assignee_membership:
                raise HTTPException(status_code=400, detail="Assignee must be a project member")

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    require_project_admin(task.project_id, current_user, db)
    db.delete(task)
    db.commit()
