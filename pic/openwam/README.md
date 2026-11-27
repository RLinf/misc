# OpenWAM LIBERO SFT experiment

Evidence for RLinf/RLinf#1597, recorded on 2026-11-26 and 2026-11-27. Complete evaluation covers 500 task/initial-state pairs per suite and checkpoint, totaling 4,000 episodes. The preliminary 100-episode subsets are retained separately below.

## Training and runtime

- RLinf: 0a671691fce4997398aff1b60cfb06422c495429.
- OpenWAM: a8992b613fdb5b1c4649f53b3a914379c49e3892.
- Base checkpoint: OpenWAM/OpenWAM-Alpha-Sim-LIBERO, revision 110b07e4d5581c81520a77419cbb0e9371df231b.
- Dataset: OpenWAM/LIBERO, revision bcb2eaf1121ae4cbd324f8862807abce282500e8; 1,693 training episodes and 273,465 windows.
- Hardware/runtime: 8 NVIDIA A800 80 GB GPUs, Python 3.11.14, PyTorch 2.11.0+cu128; flash-attn was not installed.
- SFT: 1,000 optimization steps, FSDP2, fp32 master weights and bf16 computation, microbatch 1, global batch 8, seed 42, learning rate 1e-6, cosine schedule, 100 warmup steps. Checkpoints every 100 steps. Training wall time 49.9 minutes. No held-out validation split.
- Export: documented export_checkpoint.py with --verify cuda passed.
- Evaluation: four environment workers and four rollout workers; seed 0; fixed ordered task/trial IDs. Both checkpoints use identical pairs, with no duplicates. Episodes settle for 30 zero-action steps, execute 10 actions per prediction, and use budgets of 600 steps for Spatial/Object/Goal and 700 for Long. One rollout epoch per run, auto_reset=true, ignore_terminations=true.

## Preliminary subset evaluation

Each suite covers all 10 tasks and initial-state IDs 0-9, totaling 800 episodes across both checkpoints.

| Suite | Released checkpoint | Exported step 1000 |
| --- | ---: | ---: |
| Spatial | 99/100 (99%) | 100/100 (100%) |
| Object | 100/100 (100%) | 99/100 (99%) |
| Goal | 100/100 (100%) | 95/100 (95%) |
| Long | 98/100 (98%) | 98/100 (98%) |
| All four | 397/400 (99.25%) | 392/400 (98.00%) |

The observed difference is -1.25 percentage points. Training loss decreased; success did not improve in this subset. This run demonstrates the SFT/export/evaluation workflow and is not evidence of improved benchmark performance or a result for the default 30,000-step schedule.

The PNG/SVG shows raw total/video/action loss and a labeled 50-step moving mean. The loss CSV has zero-based logged steps 0-999. First 100/last 100 means: total 0.137325/0.063728; video 0.062742/0.049344; action 0.074584/0.014385. Evaluation CSV/JSON files without the `-full` suffix contain the subset trials and per-task counts.

An AI assistant was used to run the experiment and prepare the evidence.

## Full evaluation (completed 2026-11-27)

The same base and exported checkpoints were evaluated on all 500 task/initial-state pairs per suite and checkpoint: ten tasks with initial-state IDs 0-49, totaling 4,000 episodes. The two checkpoints have identical trial sets and no repeated pairs within each run. The protocol matches the subset evaluation above, with rollout budgets 75,000 steps for Spatial/Object/Goal and 87,500 for Long.

| Suite | Released checkpoint | Exported step 1,000 |
| --- | ---: | ---: |
| Spatial | 496/500 (99.2%) | 489/500 (97.8%) |
| Object | 497/500 (99.4%) | 497/500 (99.4%) |
| Goal | 496/500 (99.2%) | 477/500 (95.4%) |
| Long | 495/500 (99.0%) | 482/500 (96.4%) |
| All four | 1984/2000 (99.20%) | 1945/2000 (97.25%) |

Observed success decreased by 1.95 percentage points after 1,000 SFT steps. The files ending in `-full.json` and `-full.csv` contain the complete episode records and aggregates for these results. The original files retain the preliminary 100-episode subsets. The training run and curve are unchanged.
