from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.models import User, Project, ProjectMember, UserRole, Task
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectOut, AddMemberRequest, UpdateMemberRole
from app.api.deps import get_current_user, get_project_member, require_project_admin

router = APIRouter()


def build_project_out(project: Project) -> dict:
    task_count = len(project.tasks) if project.tasks else 0
    return {**project.__dict__, "task_count": task_count}


@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(name=project_in.name, description=project_in.description, creator_id=current_user.id)
    db.add(project)
    db.flush()

    # Creator is admin
    membership = ProjectMember(project_id=project.id, user_id=current_user.id, role=UserRole.ADMIN)
    db.add(membership)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
    return projects


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_project_member(project_id, current_user, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_project_admin(project_id, current_user, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_in.name is not None:
        project.name = project_in.name
    if project_in.description is not None:
        project.description = project_in.description
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_project_admin(project_id, current_user, db)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()


@router.post("/{project_id}/members", status_code=201)
def add_member(project_id: int, req: AddMemberRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_project_admin(project_id, current_user, db)

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found with this email")

    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    membership = ProjectMember(project_id=project_id, user_id=user.id, role=req.role)
    db.add(membership)
    db.commit()
    return {"message": f"{user.name} added to project"}


@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_project_admin(project_id, current_user, db)

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from project")

    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(membership)
    db.commit()


@router.put("/{project_id}/members/{user_id}/role")
def update_member_role(project_id: int, user_id: int, req: UpdateMemberRole, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_project_admin(project_id, current_user, db)

    membership = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")

    membership.role = req.role
    db.commit()
    return {"message": "Role updated"}
