
```markdown
# ⚡ Financial Portfolio Mapping & Standardizer

<div align="center">

```text
  _ __  ___  _ __| |_ / _| ___ | (_) ___  | |_  _   _  ___  ___ 
 | '_ \/ _ \| '__| __| |_ / _ \| | |/ _ \ | __|| | | |/ _ \/ __|
 | |_) | (_) | |  | |_|  _| (_) | | | (_) || |_ | |_| |  __/\__ \
 | .__/ \___/|_|   \__|_|  \___/|_|_|\___/  \__| \__,_|\___||___/
 |_|                                                             

```

> **`[STATUS: PRODUCTION_READY]`**  |  **`[EXECUTION_TIME: < 5 SEC]`**  |  **`[STACK: GAS / ES6+ / HTML5]`**

---

## 🌐 Language Switch / Перемикач мови

* [English Version]([src/README.md#L27-L75)
* [Українська версія](src/README.md#L77-L104)

---

## 🇬🇧 English Version

### 📌 Problem Statement & Business Impact

When evaluating credit portfolios or tender packages from multiple lending partners, each vendor provides data with distinct column layouts, inconsistent date structures, and non-standardized field names.

* **Legacy Process:** Analysts spent **~30 minutes per dataset** manually matching columns, parsing heterogeneous dates, and rebuilding complex analytical formulas.
* **Engineered Solution:** A custom **Google Workspace Sidebar UI** built with Material Design that allows analysts to dynamically map columns via one-click cell pickers and normalize entire datasets in sub-seconds.
* **Business Result:** Reduced processing time from **30 minutes to under 5 seconds** per portfolio with zero manual formula entry.

---

### 🚀 Key Technical Features

* **Interactive Material UI:** Built-in sidebar allowing users to select target cells and click `"Взяти"` (Pick) to populate column index mapping dynamically.
* **Batch Operations (`setValues`):** Optimized memory consumption using vector array operations to bypass Spreadsheet API call limits and execution timeouts.
* **Fuzzy Region Parsing:** Normalizes 30+ regional variations (e.g., `Дніп`, `Dnip`, `Днеп` -> `Дніпропетровська область`).
* **Automated Risk Stratification:** Dynamic DPD calculation, borrower age brackets, debt-to-body ratios, and automatic identification of occupied territories (ТОТ status) and legal action candidates (*Потенційно під суди*).

---

### 📂 Repository Structure

```text
google-sheets-portfolio-mapper/
├── src/
│   ├── Code.gs            # Core Processing Engine, Parsers & Financial Models
│   └── Dialog.html        # Material Design Sidebar UI & Client-side API Bridge
├── assets/                # Screenshots & Visual Demos
├── examples/
│   └── sample_input.csv   # Anonymized sample data for testing
├── LICENSE                # MIT License
└── README.md

```

---

### 🔒 Security & First-Time Launch

Since this script operates within the Google Workspace runtime environment:

1. Open the **[Live Google Sheets Template](https://docs.google.com/spreadsheets/d/11_woKSQdP1FKHSIBtmVdzFQeK-NQjiv_Z6cmn8W7iSM/template/preview?utm_source=gemini)** and click **"Use Template"**.
2. Navigate to **Мапінг портфеля** -> **Відкрити панель мапінгу** in the top menu.
3. If Google displays an authorization prompt, click **Advanced** -> **Go to Portfolio Mapper (unsafe)** -> **Allow**.

> ℹ️ *All processing occurs entirely inside your local Google account session. No external network requests or data logging are performed.*

---

## 🇺🇦 Українська версія

### 📌 Бізнес-контекст та цінність проєкту

Під час аналізу кредитно-тендерних портфелів від різних компаній-партнерів виникає проблема відсутності єдиного стандарту: кожна компанія надає вивантаження з власною послідовністю колонок, різними форматами дат та регіонів.

* **Проблема:** Аналітики витрачали близько **30 хвилин на один файл** для відновлення послідовності колонок, перерахунку віку, DPD та ризикових категорій.
* **Розроблене рішення:** Інтерактивна бокова панель (**Sidebar UI**) на базі Google Apps Script, яка дозволяє вибрати відповідні колонки в 1 клік та миттєво звести всі дані до єдиного 22-колонкового стандарту.
* **Результат:** Час обробки та підготовки звіту скорочено з **30 хвилин до 5 секунд**.

---

### ⚙️ Ключовий функціонал та оптимізація

* **Zero-Code UI Mapping:** Зручний інтерфейс Material Design для вибору колонок кліком на клітинку.
* **Нечіткий парсинг регіонів (Fuzzy Matching):** Автоматичне приведення варіативних назв до єдиного довідника (наприклад, `Дніп`, `Dnip`, `Днеп` -> `Дніпропетровська область`).
* **Розрахунок бізнес-метрик:** Динамічний обчислювач DPD (днів прострочки), віку позичальника, пенсійного статусу, категорій боргу та оцінки юридичної перспективи стягнення (*Потенційно під суди*).
* **High Performance:** Пакетний запис масивів (`getValues()` / `setValues()`) для запобігання лімітам виконання скриптів Google.

---

### 🛠 Стек технологій

* **Core Logic:** Google Apps Script (JavaScript V8)
* **Frontend:** HTML5, CSS3 (Google Material Design Guidelines), Async JS
* **Environment:** Google Sheets API

---

## 👤 Author

**Andrii Hrydenko** — *Analytics Engineer / Data Automation Specialist*

* **GitHub:** [@Andrew-ilunarity](https://github.com/Andrew-ilunarity?utm_source=gemini)
* **Live Demo:** [Google Sheets Interactive Template](https://docs.google.com/spreadsheets/d/11_woKSQdP1FKHSIBtmVdzFQeK-NQjiv_Z6cmn8W7iSM/template/preview?utm_source=gemini)

```

```
