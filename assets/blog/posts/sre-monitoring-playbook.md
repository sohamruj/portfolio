# SRE Monitoring Playbook

A concise playbook I use for hybrid environments:

- Define **golden signals** (latency, errors, traffic, saturation).
- Use **Prometheus** to scrape metrics and **Grafana** for dashboards.
- Wire alerts to **on-call** with clear **RCA checklists** and runbooks.
- Track incidents and postmortems for **continuous improvement**.

```yaml
alert: HighCPU
expr: avg(node_cpu_seconds_total{mode!="idle"}) > 0.9
for: 5m
labels:
  severity: critical
annotations:
  summary: High CPU usage detected
```

Tools: Prometheus, Grafana, CloudWatch/CloudTrail.
