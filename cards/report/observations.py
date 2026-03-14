from collections.abc import Callable
from models import Lead

SAFETY_CHARACTERISTICS = ["always truthful", "transparent", "explainable", "unbiased"]

ObservationFn = Callable[[Lead], list[str]]
OBSERVATIONS: list[ObservationFn] = []


def observation(fn: ObservationFn) -> ObservationFn:
    """Decorator that registers a function in OBSERVATIONS."""
    OBSERVATIONS.append(fn)
    return fn


def join_with(items: list[str], conjunction: str = "and") -> str:
    """Join a list of strings with a conjunction.

    join_with(["A", "B"], "and")        -> "A and B"
    join_with(["A", "B", "C"], "or")    -> "A, B, or C"
    """
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} {conjunction} {items[1]}"
    return ", ".join(items[:-1]) + f", {conjunction} {items[-1]}"


def _missing_safety_characteristics(lead: Lead) -> list[str]:
    checked = set(lead.ai_characteristics or [])
    return [c for c in SAFETY_CHARACTERISTICS if c not in checked]


@observation
def observe_high_concern(lead: Lead) -> list[str]:
    """Observation 1: user has high concern level (3-5)."""
    if not lead.concern_level or lead.concern_level < 3:
        return []

    results = [
        f"You said your concern level was {lead.concern_level}/5. It's "
        "good that you're concerned. Awareness is the first step to managing AI risk."
    ]

    missing = _missing_safety_characteristics(lead)
    if missing:
        missing_str = join_with([f"*{c}*" for c in missing], "or")
        results.append(
            f"You didn't indicate that your AI is {missing_str}. "
            "These are properties that should matter to you — their absence may be worth investigating."
        )

    return results


@observation
def observe_low_concern(lead: Lead) -> list[str]:
    """Observation 2: user has low concern level (1-2)."""
    if not lead.concern_level or lead.concern_level > 2:
        return []

    results = [
        f"You said your concern level was {lead.concern_level}/5. It's good to hear "
        "you're not concerned, but you should be aware that AIs can still "
        "cause trouble even if you don't feel worried about it."
    ]

    others = [w for w in (lead.who_concerned or []) if w != "me"]
    if others:
        others_str = join_with([f"'{w}'" for w in others], "and")
        results.append(f"You noted that {others_str} may be concerned — you might want to check in with them.")

    missing = _missing_safety_characteristics(lead)
    if missing:
        missing_str = join_with([f"*{c}*" for c in missing], "or")
        results.append(
            f"You indicated that your AI does not have any of these properties: {missing_str}. "
            "These are properties worth examining even if your overall concern is low."
        )

    return results


@observation
def observe_public_input(lead: Lead) -> list[str]:
    """Observation 3: AI is trained on public data or prompted by public users."""
    characteristics = set(lead.ai_characteristics or [])
    triggers = {"trained on public data", "prompted by public users"}
    if not characteristics & triggers:
        return []

    return [
        "You indicated that your AI is trained on or prompted by inputs from the general public. "
        "This means you will always be dealing with untrusted, uncontrolled data. "
        "This AI presents an attack surface that is fundamentally difficult to protect."
    ]


@observation
def observe_generative(lead: Lead) -> list[str]:
    """Observation 4: AI is generative."""
    if "generative" not in (lead.ai_characteristics or []):
        return []

    return [
        "You indicated that you're using Generative AI. "
        "Generative AIs have a host of problems because they are language models, not world models. "
        "Their goal is plausibility, not truth. "
        "Producing things that *seem* true — and doing so at enormous scale — "
        "makes it harder to find information that is actually true."
    ]


@observation
def observe_classifier(lead: Lead) -> list[str]:
    """Observation 5: AI is a classifier."""
    if "a classifier" not in (lead.ai_characteristics or []):
        return []

    return [
        "You indicated that you're using Classifier AIs. "
        "Classifiers are reductionist: they work by throwing away information, "
        "mapping complex inputs to simple outputs. "
        "Be careful about what information is being discarded in that process."
    ]


def make_observations(lead: Lead) -> str:
    """Run all observations against the lead and return combined markdown."""
    results = [item for fn in OBSERVATIONS for item in fn(lead)]

    if not results:
        return ""

    items = "\n".join(f"- {r}" for r in results)
    return f"## Observations\n\n{items}\n"
