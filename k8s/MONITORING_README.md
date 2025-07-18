# Grafana Monitoring Stack

This monitoring stack provides comprehensive observability for your Node.js application with MongoDB, deployed on Kubernetes.

## 📊 Overview

The monitoring stack includes:

- **Grafana** - Visualization and dashboard platform
- **Prometheus** - Metrics collection and storage
- **MongoDB Exporter** - Database metrics collection
- **Node Exporter** - Infrastructure metrics collection
- **Application Metrics** - Custom business and performance metrics

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Grafana       │    │   Prometheus    │    │  Your App       │
│  (Dashboards)   │◄───│  (Metrics DB)   │◄───│  (Metrics)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                       ▲
                                │                       │
                    ┌─────────────────┐    ┌─────────────────┐
                    │ MongoDB Exporter│    │  Node Exporter  │
                    │ (DB Metrics)    │    │ (Infra Metrics) │
                    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster running
- kubectl configured
- Your application deployed (backend, frontend, MongoDB)

### Installation

1. **Make the deployment script executable:**
   ```bash
   chmod +x k8s/deploy-monitoring.sh
   ```

2. **Deploy the monitoring stack:**
   ```bash
   cd k8s
   ./deploy-monitoring.sh
   ```

3. **Access Grafana:**
   - URL: `http://your-domain/grafana`
   - Username: `admin`
   - Password: `admin123`

## 📈 Available Dashboards

### 1. Application Overview
**Metrics tracked:**
- HTTP requests per second
- Response time (95th percentile)
- Active connections
- MongoDB connection status
- User registrations
- Product views
- Cart operations
- Order statistics

### 2. Infrastructure Monitoring
**Metrics tracked:**
- CPU usage per node
- Memory usage per node
- Disk usage
- Network I/O
- Pod count
- Container restarts
- Load average

### 3. MongoDB Monitoring
**Metrics tracked:**
- Connection status
- Current connections
- Operations per second
- Memory usage
- Query performance
- Index usage
- Database size
- Collection document count

## 🔧 Configuration

### Application Metrics

Your Express application now exposes metrics at `/metrics` endpoint. The following metrics are automatically collected:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `active_connections` - Current active connections
- `mongodb_connection_status` - Database connection status
- `user_registrations_total` - Total user registrations
- `product_views_total` - Total product views
- `orders_total` - Total orders by status
- `cart_operations_total` - Total cart operations

### Custom Business Metrics

To track custom business events in your application:

```javascript
const { 
  incrementUserRegistrations,
  incrementProductViews,
  incrementOrders,
  incrementCartOperations 
} = require('./middleware/metricsMiddleware');

// In your routes:
// Track user registration
incrementUserRegistrations();

// Track product view
incrementProductViews();

// Track order creation
incrementOrders('completed');

// Track cart operations
incrementCartOperations('add');
```

### Prometheus Targets

Prometheus is configured to scrape metrics from:
- Backend application: `backend-service:5000/metrics`
- MongoDB exporter: `mongodb-exporter:9216/metrics`
- Node exporter: `node-exporter:9100/metrics`
- Kubernetes API server metrics
- Pod metrics with proper annotations

## 🔍 Monitoring Best Practices

### 1. Alert Rules (Recommended)

Add these alert rules to Prometheus for production monitoring:

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High error rate detected

# Database connection down
- alert: MongoDBDown
  expr: mongodb_connection_status == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: MongoDB connection is down

# High response time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: High response time detected
```

### 2. Dashboard Customization

To create custom dashboards:
1. Access Grafana at `/grafana`
2. Click "+" → "Dashboard"
3. Add panels with PromQL queries
4. Save and share with your team

### 3. Retention and Storage

Current configuration:
- Prometheus retention: 200 hours
- Storage: 5GB persistent volume
- Grafana storage: 2GB persistent volume

For production, consider:
- Increasing retention time
- Setting up Prometheus federation
- Implementing long-term storage (Thanos/Cortex)

## 🛠️ Troubleshooting

### Common Issues

1. **Grafana not accessible:**
   ```bash
   kubectl get pods -l app=grafana
   kubectl logs deployment/grafana-deployment
   ```

2. **No metrics appearing:**
   ```bash
   # Check if Prometheus is scraping targets
   kubectl port-forward svc/prometheus-service 9090:9090
   # Visit http://localhost:9090/targets
   ```

3. **MongoDB metrics missing:**
   ```bash
   kubectl get pods -l app=mongodb-exporter
   kubectl logs deployment/mongodb-exporter-deployment
   ```

4. **Application metrics not working:**
   ```bash
   # Check if metrics endpoint is accessible
   kubectl port-forward svc/backend-service 5000:5000
   curl http://localhost:5000/metrics
   ```

### Debugging Commands

```bash
# Check all monitoring pods
kubectl get pods -l app=grafana,app=prometheus,app=mongodb-exporter

# Check services
kubectl get svc | grep -E "(grafana|prometheus|mongodb-exporter)"

# Check ingress
kubectl get ingress

# View logs
kubectl logs -f deployment/grafana-deployment
kubectl logs -f deployment/prometheus-deployment
kubectl logs -f deployment/mongodb-exporter-deployment
```

## 🔒 Security Considerations

### Production Recommendations

1. **Change default credentials:**
   ```yaml
   env:
   - name: GF_SECURITY_ADMIN_PASSWORD
     valueFrom:
       secretKeyRef:
         name: grafana-secret
         key: admin-password
   ```

2. **Enable authentication:**
   - Configure OAuth/LDAP in Grafana
   - Remove anonymous access
   - Set up proper RBAC

3. **Network security:**
   - Use NetworkPolicies to restrict access
   - Enable TLS for all communications
   - Set up proper firewall rules

4. **Resource limits:**
   - Set appropriate CPU/memory limits
   - Monitor resource usage
   - Scale based on metrics volume

## 📚 Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [MongoDB Exporter](https://github.com/percona/mongodb_exporter)
- [Node Exporter](https://github.com/prometheus/node_exporter)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Kubernetes logs
3. Verify network connectivity
4. Check resource availability

## 📝 License

This monitoring setup is provided as-is for educational and production use. 