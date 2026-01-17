## Обзор проекта

Проект реализует веб-сервис для визуализации глоссария терминов анализа поведения пользователей в виде интерактивного семантического графа. Система состоит из:

- **gRPC сервера** на Python для обработки запросов к глоссарию
- **REST API** для совместимости с фронтендом
- **Веб-интерфейса** с интерактивной визуализацией графа на D3.js
- **Docker контейнеров** для легкого развертывания

## Инструкция по развертыванию

### Клонирование репозитория

```bash
git clone https://github.com/your-username/glossary-graph-service.git
cd glossary-graph-service
```

### Сборка и запуск контейнеров

```bash
# Сборка образов
docker-compose build

# Запуск всех сервисов
docker-compose up -d
```

### Проверка работы сервисов

- gRPC сервер - доступен на порту 50052 
- REST API - доступен на http://localhost:5001 
- Фронтенд - доступен на http://localhost:8081

### Тестирование

```bash
# Тестирование REST API
curl http://localhost:5001/api/terms | jq .

# Тестирование gRPC
grpcurl -plaintext localhost:50052 glossary.GlossaryService/GetAllTerms
```

## Исследования по REST и RPC, GraphQL

- [Comparative review of selected Internet communication protocols](https://arxiv.org/pdf/2212.07475): Бенчмарки REST, gRPC (RPC), GraphQL и WebSocket на Python с MongoDB, тестировали время отклика и трафик на Docker/Windows.

- [Benchmarking Performance of Data Serialization and RPC Frameworks in Microservices Architecture](https://www.semanticscholar.org/paper/Benchmarking-Performance-of-Data-Serialization-and-Nguyen/ba81ca4530e559dab7d49a84e6eaf1b80e2d9547): Сравнение gRPC, Apache Thrift (RPC) и Avro в микросервисах по сериализации и производительности RPC.
​
- [Validation of a CoAP to IEC 61850 Mapping and Benchmarking vs HTTP-REST and WS-SOAP](https://ieeexplore.ieee.org/document/8502624/): Бенчмарки задержек, байт и overhead для REST-подобных протоколов в IoT/микросервисах.
​

Первое исследование заключает, что gRPC — самый быстрый и надежный для микросервисов, GraphQL — самый медленный с проблемами библиотек; REST сбалансирован, WebSocket экономит трафик, но нестабилен на больших объемах. Docker добавляет нестабильность по сравнению с bare metal.

В работах по RPC (gRPC vs Thrift) подчеркивается превосходство gRPC в throughput и низком latency для микросервисов благодаря HTTP/2 и Protobuf.

Сравнения REST с SOAP показывают меньший overhead у REST, что актуально для масштабируемых архитектур.
​