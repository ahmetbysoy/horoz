# AI CLI Agent – Açık Kaynak Geliştirme Planı

## 🎯 Proje Hedefi

Terminal üzerinden çalışan, dosya okuma/yazma/düzenleme ve komut çalıştırma yapabilen, ücretsiz modellerle de kullanılabilen bir AI agent geliştirmek.

### Bu Proje Ne DEĞİLDİR

- Claude Code / Kilo rakibi değildir.
- Production SaaS ürünü değildir.
- Her problemi otomatik çözen sihirli araç değildir.

### Bu Proje Nedir

- Öğretici bir açık kaynak proje
- AI agent mimarisini öğrenmek için referans
- Ücretsiz kullanılabilir CLI asistanı

---

## 🏗️ Mimari

### Sistem Akışı

```text
Kullanıcı Input
      ↓
  Prompt Builder ← [Memory + State + Tool Schemas]
      ↓
  Model Router → [Free → Fallback → Local]
      ↓
  Response Parser (robust, multi-format)
      ↓
  ┌─ Düz metin → Kullanıcıya göster
  └─ Tool çağrısı → İzin kontrolü → Execution → Observe
      ↓
  State güncelle → Devam / Dur kararı
```

### Klasör Yapısı

```text
cli-agent/
├── main.py                    # Giriş noktası
├── setup_wizard.py            # İlk kurulum sihirbazı
├── .env.example               # API key şablonu
│
├── agent/
│   ├── core.py                # Ana agent sınıfı
│   ├── loop.py                # Think→Act→Observe döngüsü
│   ├── prompt_builder.py      # Prompt birleştirme
│   ├── response_parser.py     # Robust model çıktı parser
│   ├── memory.py              # Kısa/uzun süreli hafıza
│   ├── state.py               # Adım/hedef/hata takibi
│   ├── summarizer.py          # Context sıkıştırma
│   └── permission.py          # Kullanıcı izin sistemi
│
├── router/
│   ├── model_router.py        # Provider seçim mantığı
│   ├── retry.py               # Retry + backoff
│   └── streaming.py           # Provider-agnostic streaming
│
├── providers/
│   ├── base.py                # Provider interface
│   ├── openrouter.py          # OpenRouter (free modeller)
│   ├── groq.py                # Groq (hızlı fallback)
│   └── ollama.py              # Yerel model (offline)
│
├── tools/
│   ├── registry.py            # Tool kayıt sistemi
│   ├── schema.py              # Tool tanımları
│   ├── file_read.py           # Dosya okuma
│   ├── file_write.py          # Dosya yazma
│   ├── file_edit.py           # Dosya düzenleme
│   ├── shell.py               # Komut çalıştırma
│   └── security.py            # Güvenlik katmanı
│
├── config/
│   ├── settings.yaml          # Ana konfigürasyon
│   └── tools_config.yaml      # Tool izinleri
│
├── session/
│   ├── manager.py             # Session kaydet/yükle
│   └── export.py              # Konuşma dışa aktarma
│
├── telemetry/
│   ├── logger.py              # Yapılandırılmış loglama
│   └── token_tracker.py       # Token kullanım takibi
│
├── tests/
│   ├── test_parser.py
│   ├── test_router.py
│   ├── test_tools.py
│   ├── test_security.py
│   └── test_memory.py
│
└── docs/
    ├── SETUP.md               # Kurulum rehberi
    ├── API_KEYS.md            # API key alma rehberi
    ├── ARCHITECTURE.md        # Mimari açıklama
    └── CONTRIBUTING.md        # Katkı rehberi
```

---

## 📋 Geliştirme Fazları

### Faz 1: Temel İskelet (MVP)

#### 1.1 Proje Kurulumu

```bash
python3 -m venv venv
source venv/bin/activate
pip install requests tiktoken rich typer pyyaml python-dotenv
```

#### 1.2 İlk Kurulum Sihirbazı

- API key sor / `.env` üzerinden al
- Bağlantı testi yap
- Uygun free modelleri listele
- Tercih edilen modeli kaydet
- Test mesajı gönder

#### 1.3 Temel Provider Client

```python
class BaseProvider:
    def chat(self, messages, stream=False): ...
    def is_available(self) -> bool: ...
    def get_model_info(self) -> dict: ...
```

#### 1.4 Basit Chat Döngüsü

```python
while True:
    user_input = input("> ")
    response = provider.chat([
        {"role": "user", "content": user_input}
    ])
    print(response)
```

**Milestone 1:** Terminal’de model ile konuşabilme ✅

---

### Faz 2: Agent Döngüsü

#### 2.1 State Manager

```python
@dataclass
class AgentState:
    step: int = 0
    max_steps: int = 15
    goal: str = ""
    last_action: str | None = None
    last_observation: str | None = None
    errors: list[str] = field(default_factory=list)
    consecutive_errors: int = 0
    max_consecutive_errors: int = 3
    status: str = "running"  # running | completed | error | stopped

    def should_stop(self) -> bool:
        if self.step >= self.max_steps:
            return True
        if self.consecutive_errors >= self.max_consecutive_errors:
            return True
        if self.status in ("completed", "error", "stopped"):
            return True
        return False
```

#### 2.2 Agent Loop

```python
def agent_loop(user_input, state, memory):
    while not state.should_stop():
        prompt = build_prompt(
            user_input=user_input,
            memory=memory.get_context(),
            tools=tool_registry.get_schemas(),
            state=state.serialize(),
        )

        response = router.call(prompt)
        parsed = parse_response(response)

        if parsed.type == "text":
            display(parsed.content)
            state.status = "completed"

        elif parsed.type == "tool_call":
            if not permission.check(parsed.tool_call):
                state.status = "stopped"
                break

            result = execute_tool(parsed.tool_call)
            state.last_action = parsed.tool_call
            state.last_observation = result
            memory.add(parsed.tool_call, result)

        state.step += 1
```

#### 2.3 Prompt Builder

```python
def build_prompt(user_input, memory, tools, state):
    sections = [SYSTEM_PROMPT]

    if tools:
        sections.append(f"## Available Tools\n{format_tools(tools)}")
    if memory:
        sections.append(f"## Context\n{memory}")

    sections.append(f"## Current State\n{state}")
    sections.append(f"## User Request\n{user_input}")
    sections.append(OUTPUT_FORMAT_INSTRUCTION)
    return "\n\n".join(sections)
```

**Milestone 2:** Agent düşünüp tool çağırıp sonucu gözlemleyebilme ✅

---

### Faz 3: Tool Sistemi

#### 3.1 Tool Registry

```python
@dataclass
class Tool:
    name: str
    description: str
    parameters: dict
    function: Callable
    requires_permission: bool = True
    risk_level: str = "low"  # low | medium | high
```

#### 3.2 Minimum Tool Seti

- `file_read`
- `file_write`
- `file_edit`
- `run_shell`
- (opsiyonel) `web_search`

#### 3.3 Güvenlik Katmanı

- Komut adı + argüman bazlı kontrol
- Path restriction (izinli dizinler)
- Hassas path engelleme (`~/.ssh`, `/etc/shadow` vb.)
- Timeout + output limit
- Risk seviyesi ve kullanıcı onayı

#### 3.4 İzin Sistemi

- Allow / Deny
- Session boyunca allow
- Benzer çağrılar için auto-allow
- Güvenli modda tüm write/shell çağrılarında onay

**Milestone 3:** Güvenli tool çağırma + izin sistemi ✅

---

### Faz 4: Robust Response Parser

#### 4.1 Desteklenecek Formatlar

- Düz JSON
- Markdown içindeki JSON bloğu
- Kısmi/bozuk JSON (heuristic düzeltme)
- Metin + JSON karışık içerik
- Tam düz metin fallback

#### 4.2 Multi-Strategy Parser

```python
def parse_response(raw_text: str) -> ParsedResponse:
    strategies = [
        parse_clean_json,
        parse_markdown_json,
        parse_partial_json,
        parse_mixed_content,
        parse_plaintext,
    ]

    for strategy in strategies:
        result = strategy(raw_text)
        if result is not None:
            if result.type == "tool_call" and not validate_tool_schema(result.tool_call):
                continue
            return result

    return ParsedResponse(type="text", content=raw_text)
```

**Milestone 4:** Tutarsız model çıktısını güvenilir parse etme ✅

---

### Faz 5: Memory + Summarization

- Kısa süreli + uzun süreli hafıza
- Token limiti aşımında summarize + trim
- Pinned memory (kritik kararlar/constraint’ler silinmez)
- Özet içinde komutlar, hatalar, dosya değişimleri korunur

**Milestone 5:** Uzun konuşmalarda context yönetimi ✅

---

### Faz 6: Model Router + Retry

- Free → fallback → local sıralı geçiş
- Rate limit (429) için exponential backoff
- Timeout/connection error için retry
- Sağlık kontrolü + cooldown
- Task-type specialization (code/reasoning/fast)

**Milestone 6:** Kesintisiz model erişimi ✅

---

### Faz 7: Streaming + Output Control

- Provider-agnostic streaming normalization
- SSE/parça parser’ları provider bazlı uyarlama
- Tekrar temizleme + output clamp
- Soft stop / hard stop ayrımı

**Milestone 7:** Akıcı terminal deneyimi ✅

---

### Faz 8: Session Management

- Session save/load
- JSON export
- Markdown export
- Checkpoint/resume

**Milestone 8:** Konuşmaları kaydetme/yükleme ✅

---

### Faz 9: Telemetry + Logging

- Structured logs (model/tool/errors)
- Token/maliyet takibi
- Session summary
- Debug/verbose görünüm

**Milestone 9:** Tam gözlemlenebilirlik ✅

---

### Faz 10: CLI Interface (Rich)

- `chat` komutu
- `/save`, `/history`, `/quit`
- `--resume`, `--model`, `--verbose`, `--safe-mode`
- İlk çalıştırmada setup wizard

**Milestone 10:** Kullanıcı dostu terminal arayüzü ✅

---

## ⚙️ Konfigürasyon (`config/settings.yaml`)

```yaml
providers:
  openrouter:
    base_url: "https://openrouter.ai/api/v1"
    default_model: "meta-llama/llama-3.1-8b-instruct:free"
    free_only: true
  groq:
    base_url: "https://api.groq.com/openai/v1"
    default_model: "llama-3.1-8b-instant"
  ollama:
    base_url: "http://localhost:11434"
    default_model: "llama3"

agent:
  max_steps: 15
  max_consecutive_errors: 3
  deterministic: false

memory:
  max_context_tokens: 4000
  summarize_threshold: 3000
  keep_recent_messages: 10

security:
  allowed_directories: ["."]
  blocked_patterns:
    - "rm -rf /"
    - "> /dev/"
    - "chmod 777"
    - "curl.*| bash"
    - "wget.*| sh"
  sensitive_paths:
    - "~/.ssh"
    - "~/.aws"
    - "~/.gnupg"
  tool_timeout_sec: 15
  max_output_size_kb: 50
  require_confirmation: true

limits:
  max_input_tokens: 6000
  max_output_tokens: 2000
  session_token_budget: 100000
  session_api_call_budget: 500
  tool_calls_per_minute: 60

retry:
  max_attempts: 3
  base_backoff_sec: 0.5
  max_backoff_sec: 10

streaming:
  enabled: true
  refresh_rate: 10
```

---

## 🧪 Test Planı

### Birim Testleri

- Parser: temiz/broken/mixed JSON
- Security: path traversal, dangerous command, timeout
- Router: fallback + retry
- Memory: summarize threshold + context composition

### Entegrasyon Testleri

```bash
python main.py --test
# OpenRouter kapalıyken fallback testi
# 20+ mesajda memory/summarization testi
# tool çağrısı + izin akışı testi
```

---

## 📚 Dokümantasyon Planı

- `README.md`: proje nedir/ne değildir, hızlı kurulum, güvenlik modeli
- `docs/SETUP.md`: ilk kurulum adımları
- `docs/API_KEYS.md`: OpenRouter/Groq/Ollama rehberi
- `docs/ARCHITECTURE.md`: mimari açıklama ve akış
- `docs/CONTRIBUTING.md`: katkı rehberi

---

## ✅ Kabul Kriterleri

### Faz 1 (MVP)
- [ ] `python main.py` çalışır
- [ ] Free model ile chat yapılır
- [ ] Setup wizard çalışır

### Faz 2 (Agent)
- [ ] Think → Act → Observe döngüsü çalışır
- [ ] State yönetimi aktif
- [ ] Stop conditions çalışır

### Faz 3 (Tools)
- [ ] `file_read`, `file_write`, `file_edit`, `run_shell` çalışır
- [ ] Güvenlik kontrolleri aktif
- [ ] Kullanıcı izin sistemi aktif

### Faz 4 (Parser)
- [ ] Çoklu format parse edilir
- [ ] Bozuk JSON crash yapmaz

### Faz 5 (Memory)
- [ ] Uzun konuşmada context yönetimi stabil
- [ ] Summarization tetiklenir

### Faz 6 (Router)
- [ ] Provider fallback çalışır
- [ ] Retry + backoff çalışır

### Faz 7 (Streaming)
- [ ] Streaming çalışır
- [ ] Output kontrolü aktif

### Faz 8 (Session)
- [ ] Session save/load/export çalışır

### Faz 9 (Telemetry)
- [ ] Token kullanımı görünür
- [ ] Session özeti çıkar

### Faz 10 (CLI)
- [ ] Rich arayüz çalışır
- [ ] `/save`, `/history`, `/quit` komutları çalışır

---

## 🔮 Gelecek (v2.0)

- Multi-agent görev paylaşımı
- Plugin sistemi
- Web arayüzü
- Git-aware context
- AST-aware code editing
- Test yaz → çalıştır → düzelt döngüsü

---

## 📊 Karşılaştırma Tablosu

```text
                          Eski Plan    Yeni Plan
                          ─────────    ─────────
İlk kurulum rehberi         ❌           ✅
Robust response parser      ❌           ✅
Kullanıcı izin sistemi      ❌           ✅
Tool çeşitliliği            ❌           ✅
Path/argüman güvenliği      ❌           ✅
Error handling stratejisi   ❌           ✅
Session persistence         ❌           ✅
Fazlara bölünmüş plan      ❌           ✅
Gerçekçi hedef tanımı       ❌           ✅
Test detayları              Yüzeysel     Detaylı
Dokümantasyon planı         ❌           ✅
IP bazlı limit              ✅           ❌ (CLI odaklı bütçe/limit)
"Kilo seviyesi" iddiası     ✅           ❌ (kaldırıldı)
```

---

## Sonuç

Bu plan, önceki versiyonlara göre:

1. **Daha gerçekçi:** Projenin kapsamını doğru tanımlar.
2. **Daha güvenli:** İzin sistemi + path/argüman kontrolleri içerir.
3. **Daha robust:** Tutarsız model çıktıları için çoklu parser stratejisi sunar.
4. **Daha uygulanabilir:** Fazlara bölünmüş milestone yaklaşımıyla ilerler.
5. **Daha öğrenci dostu:** Kurulum, API key ve dokümantasyon adımlarını içerir.
6. **Daha test edilebilir:** Faz bazlı kabul kriterleri ve test planı sunar.

---

## 🆓 Ek: Free-First Provider Genişletme Planı

Mevcut OpenRouter + Groq + Ollama yaklaşımına ek olarak aşağıdaki sağlayıcılar roadmap’e dahil edilmelidir.

> Not: Free limitler ve model adları zamanla değişebilir; implementasyonda resmi provider dokümantasyonu ile doğrulama zorunludur.

### 1) Google AI Studio (Gemini)

Neden önemli:
- Geniş free tier
- Uzun context penceresi
- Multimodal kullanım (gelecek fazlarda)

Önerilen dosya:
- `providers/gemini.py`

### 2) DeepSeek API

Neden önemli:
- Kod üretimi/gözden geçirme kullanımında güçlü performans
- Reasoning odaklı varyantlar

Önerilen dosya:
- `providers/deepseek.py`

### 3) Hugging Face Inference API

Neden önemli:
- Çok geniş model havuzu
- Use-case bazlı model seçimi

Önerilen dosya:
- `providers/huggingface.py`

### 4) Together AI

Neden önemli:
- OpenAI-benzeri API deneyimi
- Açık model havuzuna hızlı erişim

Önerilen dosya:
- `providers/together.py`

### 5) Cohere (özellikle Embedding / RAG)

Neden önemli:
- Embedding ve retrieval odaklı kullanım
- Gelecekteki RAG genişlemesi için uygun

Önerilen dosya:
- `providers/cohere.py`

### 6) Cloudflare Workers AI

Neden önemli:
- Edge inference ve düşük latency senaryoları

Önerilen dosya:
- `providers/cloudflare.py`

---

## 🧠 Genişletilmiş Router Stratejisi (9 Provider)

Önerilen öncelik katmanları:

- Tier 1 (hızlı + free): Groq, Gemini
- Tier 2 (uzman): DeepSeek, Together
- Tier 3 (fallback): OpenRouter, HuggingFace, Cohere
- Tier 4 (edge): Cloudflare
- Tier 5 (local): Ollama

Task-type bazlı routing:
- `code` → DeepSeek/Groq/Gemini
- `fast` → Groq/Cloudflare/Gemini
- `long_context` → Gemini/Together/OpenRouter
- default → priority sırası

---

## 🔁 Multi-Key Rotation (Yasal ve Güvenli)

Her provider için birden fazla key ile rate-limit baskısını azaltmak için:

- `KEY_1`, `KEY_2`, `KEY_3` ... yükleme
- RPM bazlı cooldown takibi
- Kullanılabilir anahtarı round-robin + health bilgisiyle seçme

Önerilen dosya:
- `router/key_rotation.py`

---

## 🚦 Rate Limit Yönetimi (CLI Uyumlu)

IP-limit yerine aşağıdaki teknikler kullanılmalıdır:

1. Request batching
2. Response caching (TTL ile)
3. Adaptive throttling
4. Session API call bütçesi
5. Tool call per-minute limiti

---

## ⚙️ Ek Konfigürasyon (Provider Expansion)

```yaml
providers:
  groq:
    enabled: true
    api_keys: []
    priority: 1
    use_for: ["fast", "chat"]

  gemini:
    enabled: true
    api_keys: []
    priority: 2
    use_for: ["long_context", "multimodal"]

  deepseek:
    enabled: true
    api_keys: []
    priority: 3
    use_for: ["code", "reasoning"]

  together:
    enabled: true
    api_keys: []
    priority: 4
    use_for: ["chat", "fast"]

  openrouter:
    enabled: true
    api_keys: []
    priority: 5
    use_for: ["fallback"]

  huggingface:
    enabled: true
    api_keys: []
    priority: 6
    use_for: ["specialized_models"]

  cohere:
    enabled: true
    api_keys: []
    priority: 7
    use_for: ["embedding", "rag"]

  cloudflare:
    enabled: false
    account_id: ""
    api_tokens: []
    priority: 8
    use_for: ["edge", "low_latency"]

  ollama:
    enabled: true
    priority: 9
    use_for: ["offline", "local"]

routing:
  strategy: "smart"
  task_detection: true
  auto_fallback: true
  max_retries_per_provider: 2

rate_limiting:
  enable_rotation: true
  enable_caching: true
  enable_throttling: true
  cache_ttl_hours: 24
```

---

## 📊 Provider Karşılaştırma (Takip Listesi)

Aşağıdaki metrikler düzenli takip edilmelidir:

- Dakikalık istek limiti (RPM)
- Günlük/aylık ücretsiz kota
- Maksimum context
- Streaming desteği
- Tool-calling/JSON output güvenilirliği
- Ortalama gecikme (P50/P95)

Bu tablo `docs/PROVIDER_MATRIX.md` içinde güncel tutulmalıdır.
