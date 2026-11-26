# OpenWAM LIBERO SFT experiment

Evidence for RLinf/RLinf#1597, recorded on 2026-11-26. This is a 100-trajectory subset per suite and per checkpoint, totaling 800 evaluation trajectories.

- RLinf: 0a671691fce4997398aff1b60cfb06422c495429.
- OpenWAM: a8992b613fdb5b1c4649f53b3a914379c49e3892.
- Base checkpoint: OpenWAM/OpenWAM-Alpha-Sim-LIBERO, revision 110b07e4d5581c81520a77419cbb0e9371df231b.
- Dataset: OpenWAM/LIBERO, revision bcb2eaf1121ae4cbd324f8862807abce282500e8; 1,693 training episodes and 273,465 windows.
- Hardware/runtime: 8 NVIDIA A800 80 GB GPUs, Python 3.11.14, PyTorch 2.11.0+cu128; flash-attn was not installed.
- SFT: 1,000 optimization steps, FSDP2, fp32 master weights and bf16 computation, microbatch 1, global batch 8, seed 42, learning rate 1e-6, cosine schedule, 100 warmup steps. Checkpoints every 100 steps. Training wall time 49.9 minutes. No held-out validation split.
- Export: documented export_checkpoint.py with --verify cuda passed.
- Evaluation: four environment workers and four rollout workers; seed 0; fixed ordered task/trial IDs. Each suite covers all 10 tasks and initial-state IDs 0-9. Both checkpoints use identical pairs, with no duplicates. Episodes settle for 30 zero-action steps, execute 10 actions per prediction, and use budgets of 600 steps for Spatial/Object/Goal and 700 for Long. One rollout epoch per run, auto_reset=true, ignore_terminations=true.

| Suite | Released checkpoint | Exported step 1000 |
| --- | ---: | ---: |
| Spatial | 99/100 (99%) | 100/100 (100%) |
| Object | 100/100 (100%) | 99/100 (99%) |
| Goal | 100/100 (100%) | 95/100 (95%) |
| Long | 98/100 (98%) | 98/100 (98%) |
| All four | 397/400 (99.25%) | 392/400 (98.00%) |

The observed difference is -1.25 percentage points. Training loss decreased; success did not improve in this subset. This run demonstrates the SFT/export/evaluation workflow and is not evidence of improved benchmark performance or a result for the default 30,000-step schedule.

The PNG/SVG shows raw total/video/action loss and a labeled 50-step moving mean. The loss CSV has zero-based logged steps 0-999. First 100/last 100 means: total 0.137325/0.063728; video 0.062742/0.049344; action 0.074584/0.014385. Evaluation CSV/JSON contains every trial and per-task counts. The later 500-trial runs are excluded from these files.

An AI assistant was used to run the experiment and prepare the evidence.
