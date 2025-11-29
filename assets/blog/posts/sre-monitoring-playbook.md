# SRE Monitoring Playbook

- Define **golden signals** (latency, errors, traffic, saturation).
- Use **Prometheus** to scrape metrics and **Grafana** for dashboards.
- Wire alerts to **on-call** with clear **RCA checklists** and runbooks.

```yaml
alert: HighCPU
expr: avg(node_cpu_seconds_total{mode!="idle"}) > 0.9
for: 5m
labels:
  severity: critical
```
