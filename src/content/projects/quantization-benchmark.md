---
title: LLM quantization and inference benchmark
cartridge: QUANT BENCH
summary: What GGUF Q4–Q6, AWQ, GPTQ, EXL3, FP8 and NF4 cost in quality, latency, VRAM and power on an RTX 5070 Ti.
role: '[confirm] Solo'
period: { start: '[add]' }
status: in-progress
featured: true
order: 2
tags: [LLM inference, Quantization, GGUF, AWQ, GPTQ, Benchmarking]
skills: [llm-inference]
highlight:
  value: '[add]'
  label: Best quality-per-GB format (KL divergence against an FP16 reference)
  source: '[add] results CSV and commit'
cli:
  - 'formats: GGUF Q4–Q6, AWQ, GPTQ, EXL3, FP8, NF4'
  - 'hardware: RTX 5070 Ti'
resume: { include: true, bullets: [] }
---

Case study arrives in M3. The results CSV also feeds the era charts and the CLI's `stats quantization`.
