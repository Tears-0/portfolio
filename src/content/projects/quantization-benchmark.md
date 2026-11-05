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

## The question

[add case study: why quality, latency, VRAM and power all matter when choosing a format to run an LLM locally]

## Setup

[add case study: the model or models, the RTX 5070 Ti machine, the runtime used for each format (GGUF Q4–Q6, AWQ, GPTQ, EXL3, FP8, NF4), and the FP16 reference]

## Method

[add case study: how KL divergence against FP16 was measured (prompt set, token count), and how speed, VRAM and power were read]

## Results

The chart and the numbers come from `src/data/benchmark.csv`, the same file the 1999 console's `stats quantization` reads.

[add case study: the best quality-per-GB format, the trade-offs between the others, and the commit the results came from]

## What I would do next

[add case study: the next formats, models or hardware to test]
