from typing import Dict, List


CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "departure": [
        "id", "keys", "key", "wallet", "charger", "bag",
        "late", "leaving", "leave", "door", "morning",
        "forgot", "forget", "searching"
    ],
    "study": [
        "assignment", "homework", "notebook", "notes", "exam",
        "study", "college", "class", "lecture", "project",
        "redo", "rework", "mistake"
    ],
    "organization": [
        "lost", "misplaced", "search", "searching", "find",
        "finding", "mess", "organize", "organization",
        "where", "forgot"
    ],
    "time": [
        "late", "delay", "waiting", "wasted", "minutes",
        "hours", "time", "slow", "again"
    ],
    "digital": [
        "file", "folder", "password", "tab", "email",
        "document", "download", "upload", "computer",
        "laptop", "phone"
    ],
}


def normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


def detect_categories(text: str) -> List[str]:
    normalized = normalize(text)
    matches = []

    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            matches.append(category)

    if not matches:
        matches.append("general")

    return matches


def extract_keywords(text: str) -> List[str]:
    normalized = normalize(text)

    all_keywords = []

    for keywords in CATEGORY_KEYWORDS.values():
        all_keywords.extend(keywords)

    found = []

    for keyword in all_keywords:
        if keyword in normalized and keyword not in found:
            found.append(keyword)

    return found[:8]


def analyze_observation(text: str):
    categories = detect_categories(text)
    keywords = extract_keywords(text)

    if "departure" in categories:
        friction = "Repeated preparation and misplaced-item friction"

    elif "study" in categories:
        friction = "Repeated study and rework friction"

    elif "digital" in categories:
        friction = "Repeated digital organization friction"

    elif "time" in categories:
        friction = "Repeated time-loss friction"

    elif "organization" in categories:
        friction = "Repeated organization friction"

    else:
        friction = "Potential recurring daily friction"

    return {
        "category": categories[0],
        "friction": friction,
        "keywords": keywords,
    }


def build_problem(category: str, observations: list):
    category_observations = [
        observation
        for observation in observations
        if observation["category"] == category
    ]

    if category == "departure":
        title = "Departure Preparation"
        description = (
            "Several small delays appear to happen while preparing to leave. "
            "Frequently used items may not have consistent locations."
        )
        intervention = (
            "Create an Exit Station near the door for your ID, keys, wallet "
            "and charger."
        )

    elif category == "study":
        title = "Study & Rework Friction"
        description = (
            "Repeated study-related incidents suggest that time may be lost "
            "through rework, misplaced material or an inconsistent study setup."
        )
        intervention = (
            "Create one fixed study workspace and keep active notes and "
            "assignments together."
        )

    elif category == "digital":
        title = "Digital Organization"
        description = (
            "Repeated digital friction suggests that files, tabs or documents "
            "may not have a consistent organization system."
        )
        intervention = (
            "Create one predictable folder structure for active documents "
            "and archive completed work."
        )

    elif category == "time":
        title = "Recurring Time Loss"
        description = (
            "Several observations contain repeated delays or wasted time. "
            "These incidents may share an underlying workflow problem."
        )
        intervention = (
            "Identify the most common delay and add a small preparation step "
            "before it happens."
        )

    elif category == "organization":
        title = "Everyday Organization"
        description = (
            "Repeated searching and misplaced-item incidents suggest that "
            "frequently used things may not have consistent locations."
        )
        intervention = (
            "Give frequently used items a fixed home and return them there "
            "after each use."
        )

    else:
        title = "Recurring Daily Friction"
        description = (
            "These observations may contain a repeated friction pattern. "
            "More observations will help INVISIBLE determine the underlying problem."
        )
        intervention = (
            "Continue logging similar incidents so a stronger pattern can be detected."
        )

    minutes = min(len(category_observations) * 7, 60)

    severity = min(5, max(1, len(category_observations)))

    return {
        "title": title,
        "description": description,
        "observation_ids": [
            observation["id"] for observation in category_observations
        ],
        "severity": severity,
        "estimated_minutes_lost": minutes,
        "intervention": intervention,
    }
