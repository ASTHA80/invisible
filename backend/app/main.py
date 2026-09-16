from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import UserCreate, ObservationCreate, InterventionCreate
from .analyzer import analyze_observation, build_problem
from .database import (
    users,
    observations,
    problems,
    interventions,
    add_user,
    get_user,
    get_user_by_email,
    add_observation,
    replace_user_problems,
    add_intervention,
)


app = FastAPI(
    title="INVISIBLE API",
    description="Find the problems you've stopped noticing.",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT / HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "name": "INVISIBLE API",
        "message": "Find the problems you've stopped noticing.",
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "invisible-backend",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ============================================================
# USERS
# ============================================================

@app.post("/api/users")
def create_user(payload: UserCreate):

    existing = get_user_by_email(payload.email)

    if existing:
        return {
            "user": existing,
            "existing": True,
        }

    user = add_user(
        name=payload.name.strip(),
        email=payload.email.strip(),
    )

    return {
        "user": user,
        "existing": False,
    }


@app.get("/api/users/{user_id}")
def read_user(user_id: int):

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


# ============================================================
# OBSERVATIONS
# ============================================================

@app.post("/api/observations")
def create_observation(payload: ObservationCreate):

    user = get_user(payload.user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    analysis = analyze_observation(payload.text)

    observation = add_observation(
        user_id=payload.user_id,
        text=payload.text,
        category=analysis["category"],
        friction=analysis["friction"],
        keywords=analysis["keywords"],
    )

    # Only analyze this user's observations.
    user_observations = [
        item
        for item in observations
        if item["user_id"] == payload.user_id
    ]

    grouped = {}

    for item in user_observations:

        category = item["category"]

        if category not in grouped:
            grouped[category] = []

        grouped[category].append(item)

    generated_problems = []

    for category, items in grouped.items():

        if len(items) >= 2:

            problem = build_problem(
                category,
                items,
            )

            problem["category"] = category

            generated_problems.append(problem)

    replace_user_problems(
        payload.user_id,
        generated_problems,
    )

    user_problems = [
        problem
        for problem in problems
        if problem["user_id"] == payload.user_id
    ]

    return {
        "observation": observation,
        "problems": user_problems,
    }


@app.get("/api/observations")
def get_observations(user_id: int):

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user_observations = [
        observation
        for observation in observations
        if observation["user_id"] == user_id
    ]

    return {
        "count": len(user_observations),
        "observations": user_observations,
    }


# ============================================================
# PROBLEMS
# ============================================================

@app.get("/api/problems")
def get_problems(user_id: int):

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user_problems = [
        problem
        for problem in problems
        if problem["user_id"] == user_id
    ]

    return {
        "count": len(user_problems),
        "problems": user_problems,
    }


# ============================================================
# PROBLEM MAP
# ============================================================

@app.get("/api/problem-map")
def get_problem_map(user_id: int):

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user_observations = [
        observation
        for observation in observations
        if observation["user_id"] == user_id
    ]

    user_problems = [
        problem
        for problem in problems
        if problem["user_id"] == user_id
    ]

    nodes = []
    edges = []

    for observation in user_observations:

        nodes.append({
            "id": f"observation-{observation['id']}",
            "type": "observation",
            "label": observation["text"],
            "category": observation["category"],
            "friction": observation["friction"],
            "keywords": observation["keywords"],
        })

    for problem in user_problems:

        problem_node_id = f"problem-{problem['id']}"

        nodes.append({
            "id": problem_node_id,
            "type": "problem",
            "label": problem["title"],
            "category": problem["category"],
            "severity": problem["severity"],
            "estimated_minutes_lost": problem[
                "estimated_minutes_lost"
            ],
        })

        for observation_id in problem["observation_ids"]:

            edges.append({
                "id": f"edge-{observation_id}-{problem['id']}",
                "source": f"observation-{observation_id}",
                "target": problem_node_id,
            })

    return {
        "nodes": nodes,
        "edges": edges,
    }


# ============================================================
# INTERVENTIONS
# ============================================================

@app.post("/api/interventions")
def create_intervention(payload: InterventionCreate):

    user = get_user(payload.user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    matching_problem = next(
        (
            problem
            for problem in problems
            if problem["id"] == payload.problem_id
            and problem["user_id"] == payload.user_id
        ),
        None,
    )

    if matching_problem is None:
        raise HTTPException(
            status_code=404,
            detail="Problem not found",
        )

    intervention = add_intervention(
        user_id=payload.user_id,
        problem_id=payload.problem_id,
        action=payload.action,
    )

    return intervention


@app.get("/api/interventions")
def get_interventions(user_id: int):

    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user_interventions = [
        intervention
        for intervention in interventions
        if intervention["user_id"] == user_id
    ]

    return {
        "count": len(user_interventions),
        "interventions": user_interventions,
    }


@app.patch("/api/interventions/{intervention_id}")
def update_intervention(
    intervention_id: int,
    user_id: int,
    status: str,
):

    valid_statuses = {
        "worked",
        "didnt_work",
        "forgot",
        "pending",
    }

    if status not in valid_statuses:

        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Use one of: {sorted(valid_statuses)}",
        )

    for intervention in interventions:

        if (
            intervention["id"] == intervention_id
            and intervention["user_id"] == user_id
        ):

            intervention["status"] = status

            return intervention

    raise HTTPException(
        status_code=404,
        detail="Intervention not found",
    )
