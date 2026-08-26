"""Transmission slippage base rate, from the Ministry of Power's own record.

Source: data.gov.in resource 2341d1d1-34bd-4471-88b5-815d45a919d0,
"Project-wise Ongoing Delayed Inter State Transmission Systems (ISTS)
Transmission Projects", tabled in the Rajya Sabha in reply to an unstarred
question on 5 April 2022.

Censoring note, and it matters for how the number is read: every row is a
project that was still ONGOING when the answer was tabled. The delay recorded
is the delay anticipated at that moment, not the delay finally realised. Each
observation is therefore right censored, and the true slippage is at least the
figure below. The base rate is a floor, not a midpoint.
"""
import json
import statistics as st
from pathlib import Path

RAW = Path(__file__).resolve().parents[1] / "data" / "raw" / "ists_delays.json"
OUT = Path(__file__).resolve().parents[1] / "data" / "base_rate.json"

SOURCE = {
    "title": "Project-wise Ongoing Delayed Inter State Transmission Systems (ISTS) Transmission Projects",
    "publisher": "Ministry of Power, tabled in the Rajya Sabha",
    "question": "Unstarred question, 5 April 2022",
    "resource_id": "2341d1d1-34bd-4471-88b5-815d45a919d0",
    "url": "https://data.gov.in/resource/2341d1d1-34bd-4471-88b5-815d45a919d0",
    "censoring": "right censored, all projects ongoing at tabling; delays are a floor",
}


def load(path=RAW):
    recs = json.loads(Path(path).read_text())["records"]
    rows = []
    for r in recs:
        d = r.get("delay_in_months")
        if d is None:
            continue
        rows.append(
            {
                "project": r["name_of_project"].strip(),
                "agency": r["executing_agency"].strip(),
                "approved": r.get("latest_approved_schedule"),
                "anticipated": r.get("anticipated_date"),
                "cost_cr": r.get("approved_cost_in_rs__cr_"),
                "delay_months": float(d),
            }
        )
    return rows


def pct(xs, p):
    """Nearest rank percentile. Small n, so no interpolation games."""
    s = sorted(xs)
    k = max(0, min(len(s) - 1, round(p / 100 * len(s) + 0.5) - 1))
    return s[k]


def ownership(agency):
    """Central PSU, private TSP, or unattributed.

    Every private row on this list names its parent in the agency string
    ("A Subsidiary of ... TL"), which is how the Ministry tabled it. Power Grid
    is the central transmission utility. One row is tabled as "NA".
    """
    a = agency.strip()
    if a.lower().startswith("power grid"):
        return "CENTRAL_PSU"
    if a.upper() == "NA":
        return "UNATTRIBUTED"
    return "PRIVATE_TSP"


def _stats(rows):
    d = [r["delay_months"] for r in rows]
    cost = [r["cost_cr"] for r in rows if r["cost_cr"]]
    w = (
        sum(r["delay_months"] * r["cost_cr"] for r in rows if r["cost_cr"]) / sum(cost)
        if cost
        else None
    )
    return {
        "n": len(d),
        "median_months": st.median(d),
        "mean_months": round(st.mean(d), 1),
        "cost_weighted_mean_months": round(w, 1) if w else None,
        "max_months": max(d),
        "approved_cost_cr": round(sum(cost), 2),
    }


def base_rate(rows):
    d = [r["delay_months"] for r in rows]
    cost = [r["cost_cr"] for r in rows if r["cost_cr"]]
    weighted = (
        sum(r["delay_months"] * r["cost_cr"] for r in rows if r["cost_cr"]) / sum(cost)
        if cost
        else None
    )
    by_agency = {}
    for r in rows:
        by_agency.setdefault(r["agency"], []).append(r["delay_months"])

    return {
        "n": len(d),
        "median_months": st.median(d),
        "mean_months": round(st.mean(d), 1),
        "min_months": min(d),
        "max_months": max(d),
        "p25_months": pct(d, 25),
        "p75_months": pct(d, 75),
        "p90_months": pct(d, 90),
        "cost_weighted_mean_months": round(weighted, 1) if weighted else None,
        "total_approved_cost_cr": round(sum(cost), 2),
        "share_over_12_months": round(sum(1 for x in d if x > 12) / len(d), 3),
        "by_ownership": {
            k: _stats([r for r in rows if ownership(r["agency"]) == k])
            for k in ("CENTRAL_PSU", "PRIVATE_TSP", "UNATTRIBUTED")
            if any(ownership(r["agency"]) == k for r in rows)
        },
        "by_agency": {
            k: {"n": len(v), "median_months": st.median(v)}
            for k, v in sorted(by_agency.items(), key=lambda kv: -len(kv[1]))
        },
        "source": SOURCE,
    }


def demo():
    """One runnable check: fails if the arithmetic or the data shape breaks."""
    fake = [
        {"project": "a", "agency": "X", "approved": None, "anticipated": None, "cost_cr": 100, "delay_months": 2.0},
        {"project": "b", "agency": "X", "approved": None, "anticipated": None, "cost_cr": 100, "delay_months": 4.0},
        {"project": "c", "agency": "Y", "approved": None, "anticipated": None, "cost_cr": 800, "delay_months": 24.0},
    ]
    b = base_rate(fake)
    assert b["n"] == 3
    assert b["median_months"] == 4.0
    # cost weighting must pull toward the expensive, very late project
    assert b["cost_weighted_mean_months"] > b["mean_months"], b
    assert b["by_agency"]["X"]["n"] == 2
    assert b["share_over_12_months"] == round(1 / 3, 3)

    assert ownership("Power Grid") == "CENTRAL_PSU"
    assert ownership("NA") == "UNATTRIBUTED"
    assert ownership("Jam Khambaliya Transco Limited (A Subsidiary of Adani TL)") == "PRIVATE_TSP"

    real = load()
    assert len(real) == 25, f"expected 25 ISTS rows, got {len(real)}"
    assert all(r["delay_months"] >= 0 for r in real), "negative delay is not a delay"
    rb = base_rate(real)
    # every row lands in exactly one ownership bucket
    assert sum(v["n"] for v in rb["by_ownership"].values()) == 25, rb["by_ownership"]
    # the headline claim this project rests on
    assert (
        rb["by_ownership"]["PRIVATE_TSP"]["cost_weighted_mean_months"]
        > rb["by_ownership"]["CENTRAL_PSU"]["cost_weighted_mean_months"]
    ), "private-vs-PSU gap inverted; the landing page claim is stale"
    print("self-check ok")


if __name__ == "__main__":
    demo()
    rows = load()
    b = base_rate(rows)
    OUT.write_text(json.dumps(b, indent=2))
    print(json.dumps({k: v for k, v in b.items() if k not in ("by_agency", "source")}, indent=2))
    print("\nby agency:")
    for k, v in b["by_agency"].items():
        print(f"  {k:<28} n={v['n']:<3} median={v['median_months']}")
