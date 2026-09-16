from datetime import datetime
from typing import Dict, List, Any


users: List[Dict[str, Any]] = []
observations: List[Dict[str, Any]] = []
problems: List[Dict[str, Any]] = []
interventions: List[Dict[str, Any]] = []


next_user_id = 1
next_observation_id = 1
next_problem_id = 1
next_intervention_id = 1


def add_user(name: str, email: str):
    global next_user_id

    user = {
        "id": next_user_id,
        "name": name,
        "email": email.lower().strip(),
        "created_at": datetime.utcnow(),
    }

    users.append(user)
    next_user_id += 1

    return user


def get_user(user_id: int):
    for user in users:
        if user["id"] == user_id:
            return user

    return None


def get_user_by_email(email: str):
    email = email.lower().strip()

    for user in users:
        if user["email"] == email:
            return user

    return None


def add_observation(
    user_id: int,
    text: str,
    category: str,
    friction: str,
    keywords: List[str],
):
    global next_observation_id

    observation = {
        "id": next_observation_id,
        "user_id": user_id,
        "text": text,
        "category": category,
        "friction": friction,
        "keywords": keywords,
        "created_at": datetime.utcnow(),
    }

    observations.append(observation)
    next_observation_id += 1

    return observation


def replace_user_problems(
    user_id: int,
    new_problems: List[Dict[str, Any]],
):
    global problems
    global next_problem_id

    # Remove only this user's previous generated problems.
    problems[:] = [
        problem
        for problem in problems
        if problem["user_id"] != user_id
    ]

    for item in new_problems:
        problem = {
            "id": next_problem_id,
            "user_id": user_id,
            "title": item["title"],
            "description": item["description"],
            "category": item.get("category", "general"),
            "observation_ids": item["observation_ids"],
            "severity": item["severity"],
            "estimated_minutes_lost": item["estimated_minutes_lost"],
            "intervention": item["intervention"],
        }

        problems.append(problem)
        next_problem_id += 1


def add_intervention(
    user_id: int,
    problem_id: int,
    action: str,
):
    global next_intervention_id

    intervention = {
        "id": next_intervention_id,
        "user_id": user_id,
        "problem_id": problem_id,
        "action": action,
        "status": "not_started",
        "created_at": datetime.utcnow(),
    }

    interventions.append(intervention)
    next_intervention_id += 1

    return intervention
