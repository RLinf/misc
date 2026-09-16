"""Rebuild the published LIBERO comparisons using the Flash Mode name.

Run with Python, matplotlib, and numpy installed. All plotting inputs are in
the adjacent CSV files; no benchmark logs or network access are required.
"""

import csv
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent
COLORS = ("#277DA1", "#F8961E", "#7B2CBF")
LABELS = ("Flash Mode", "Codex (no reasoning)", "Codex (reasoning high)")


def read_rows(filename):
    with (ROOT / filename).open() as handle:
        return list(csv.DictReader(handle))


def values(rows, key, scale=1):
    return [float(row[key]) * scale if row[key] else np.nan for row in rows]


def decorate(ax, labels):
    ax.set_xticks(np.arange(len(labels)), labels, rotation=55, ha="right", fontsize=8)
    ax.axvline(9.5, color="#777777", linewidth=1, alpha=0.6)
    ax.grid(axis="y", alpha=0.2)


def plot_full():
    rows = read_rows("libero_pro.csv")
    assert [sum(int(row[key]) for row in rows) for key in
            ("flash_success", "codex_success", "codex_high_success")] == [581, 500, 628]
    fig, axes = plt.subplots(4, 2, figsize=(18, 18), constrained_layout=True)
    width = 0.25
    for index, (family, label) in enumerate(
        (("spatial", "Spatial"), ("object", "Object"), ("goal", "Goal"), ("10", "Long"))
    ):
        group = [row for row in rows if row["family"] == family]
        x = np.arange(len(group))
        for method, prefix in enumerate(("flash", "codex", "codex_high")):
            for col, (metric, scale) in enumerate((("success", 10), ("execution_s", 1))):
                axes[index, col].bar(
                    x + (method - 1) * width, values(group, f"{prefix}_{metric}", scale),
                    width, color=COLORS[method], label=LABELS[method],
                )
        success = sum(int(row["flash_success"]) for row in group)
        axes[index, 0].set_title(f"{label}: success rate — Flash Mode {success}/200")
        axes[index, 0].set_ylabel("Success rate (%)")
        axes[index, 0].set_ylim(0, 112)
        axes[index, 1].set_title(f"{label}: mean execution/planner time")
        axes[index, 1].set_ylabel("Seconds per episode")
        for i, row in enumerate(group):
            if not row["flash_execution_s"]:
                axes[index, 0].text(i - width, 4, "No plan (0/10)", rotation=90,
                                    fontsize=7, ha="center", va="bottom")
                axes[index, 1].text(i - width, 4, "N/A", rotation=90,
                                    fontsize=7, ha="center", va="bottom")
        for ax in axes[index]:
            decorate(ax, [row["task"] for row in group])
    for ax in axes[0]:
        ax.legend(loc="upper right", fontsize=8, ncol=3)
    fig.suptitle("Flash Mode vs. Codex — LIBERO-PRO (task/swap, 10 seeds per task)", fontsize=17)
    fig.savefig(ROOT / "flash_libero_pro_performance_time.png", dpi=180)
    plt.close(fig)


def plot_object():
    rows = read_rows("object.csv")
    fig, axes = plt.subplots(2, 1, figsize=(15, 9), constrained_layout=True)
    x = np.arange(len(rows))
    width = 0.38
    for method, prefix in enumerate(("flash", "codex")):
        for col, metric in enumerate(("success", "execution_s")):
            axes[col].bar(x + (method - 0.5) * width, values(rows, f"{prefix}_{metric}"),
                          width, color=COLORS[method], label=LABELS[method])
    axes[0].set_ylim(0, 11.3)
    axes[0].set_ylabel("Successful episodes (out of 10)")
    axes[0].set_title("Object tasks: per-task performance")
    axes[0].text(0.01, 0.96, "Overall: Flash Mode 179/200 (89.5%) · Codex 186/200 (93.0%)",
                 transform=axes[0].transAxes, va="top", fontsize=11)
    axes[0].legend(loc="lower right")
    axes[1].set_ylabel("Execution time per episode (seconds)")
    axes[1].set_title("Object tasks: execution time (service startup excluded)")
    flash_mean = np.mean(values(rows, "flash_execution_s"))
    codex_mean = np.mean(values(rows, "codex_execution_s"))
    axes[1].text(0.01, 0.96, f"Mean: Flash Mode {flash_mean:.1f}s · Codex {codex_mean:.1f}s",
                 transform=axes[1].transAxes, va="top", fontsize=11)
    axes[1].legend(loc="upper right")
    for ax in axes:
        decorate(ax, [row["task"] for row in rows])
    fig.suptitle("Flash Mode vs. Codex (no reasoning) — LIBERO Object", fontsize=15)
    fig.savefig(ROOT / "flash_object_performance_time.png", dpi=180)
    plt.close(fig)


if __name__ == "__main__":
    plot_full()
    plot_object()
