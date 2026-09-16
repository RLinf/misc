# Flash Mode figures

Run `python plot.py` with matplotlib and numpy installed to regenerate both PNGs.
The CSV files are the complete plotting inputs, so future label changes do not
require access to private experiment logs.

These figures preserve the published comparison; they are not a new evaluation.
The full comparison has 581/800 Flash Mode successes, 500/800 Codex successes
without reasoning, and 628/800 Codex successes with high reasoning. The Object
comparison has 179/200 and 186/200 successes respectively.

## Data sources and timing

- `object.csv`: the original Object plotting CSV, with the method renamed.
- `libero_pro.csv`: Flash success counts transcribed from the original figure's
  integer bars and checked against the four family totals (149, 179, 139, 114).
  Both Codex series come from the original 800-episode logs. For concatenated
  transcript records, the last complete record is used; their success counts
  reproduce the published figure.
- Flash execution times come from the corresponding source episode's recorded
  tool durations, checked against the original plotted bars. The original zero
  bars for Spatial task 7 and Long task 9 are retained as published, rather than
  replaced with timings from another run. Empty timing cells correspond to the
  two unavailable plans: Goal swap 0 and Long swap 9.

Codex timing is the mean planner duration across ten seeds per task. Flash timing
is a single source-episode tool duration per plan where represented, not the mean
of ten Flash evaluations. Model/service startup is excluded. Success rates use
the complete evaluation matrix, counting the two missing plans as failures.
